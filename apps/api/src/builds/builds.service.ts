import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit
} from "@nestjs/common";
import { promises as fs, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import * as path from "node:path";
import fg from "fast-glob";
import { AuthUser } from "../common/auth-user.interface";
import { GitService } from "../common/git.service";
import { pipelineBuildStage } from "../common/pipeline-status";
import { projectRoot, storageRoot, workspaceRoot } from "../common/storage";
import { PrismaService } from "../prisma/prisma.service";
import { TriggerBuildDto } from "./dto/build.dto";

type BuildStage = "qa" | "uat" | "release";

const STAGE_LABELS: Record<string, string> = {
  qa: "QA",
  uat: "UAT",
  release: "Release"
};

const BUILD_STATUS_LABELS: Record<string, string> = {
  running: "打包中",
  success: "成功",
  failed: "失败"
};

const MIME_TYPES: Record<string, string> = {
  apk: "application/vnd.android.package-archive",
  ipa: "application/octet-stream",
  jar: "application/java-archive",
  war: "application/java-archive",
  zip: "application/zip"
};

type BuildWithPipeline = {
  id: string;
  pipelineId: string;
  stage: string;
  buildNumber: number;
  versionName: string | null;
  versionCode: number | null;
  channel: string | null;
  mergeSha: string | null;
  status: string;
  progress: number;
  startedAt: Date | null;
  finishedAt: Date | null;
  durationMs: number | null;
  exitCode: number | null;
  failReason: string | null;
  logPath: string | null;
  logSizeBytes: number;
  triggeredBy: string | null;
  createdAt: Date;
  pipeline: {
    id: string;
    name: string;
    branch: string;
    appId: string;
    task: {
      id: string;
      title: string;
      requirement: { id: string; code: string; title: string } | null;
    };
    app: {
      id: string;
      name: string;
      code: string;
      platform: string;
      repo: string;
      defaultBranch: string;
      artifactType: string;
      artifactPattern: string | null;
      branchesJson: string;
      buildScript: string;
    };
  };
  artifacts: {
    id: string;
    displayName: string;
    originalName: string;
    type: string;
    mimeType: string;
    sizeBytes: number;
    status: string;
    downloadCount: number;
    createdAt: Date;
  }[];
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function nowStamp(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
    now.getHours()
  )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

@Injectable()
export class BuildsService implements OnModuleInit {
  private queue: string[] = [];
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly gitService: GitService
  ) {}

  async onModuleInit() {
    await this.prisma.build.updateMany({
      where: { status: "running" },
      data: {
        status: "failed",
        failReason: "服务重启，构建中断",
        finishedAt: new Date()
      }
    });
  }

  isBusy(): boolean {
    return this.running || this.queue.length > 0;
  }

  async trigger(pipelineId: string, user: AuthUser, dto: TriggerBuildDto = {}) {
    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id: pipelineId },
      include: { app: true }
    });

    if (!pipeline) {
      throw new NotFoundException("流水不存在");
    }

    const stage = pipelineBuildStage(pipeline.status);
    if (!stage) {
      throw new BadRequestException("当前流水状态不能打包");
    }

    if (stage === "qa" && pipeline.reworkFrom) {
      throw new BadRequestException("自测/测试退回后请先重新合并 QA 再打包");
    }

    const stageRole = stage === "qa" ? "dev" : "qa";
    if (user.role !== "admin" && user.role !== stageRole) {
      throw new ForbiddenException(
        stage === "qa" ? "QA 打包只能由开发执行" : "UAT / Release 打包只能由测试执行"
      );
    }

    const running = await this.prisma.build.findFirst({
      where: { pipelineId, status: "running" }
    });

    if (running) {
      throw new BadRequestException("该流水正在打包，请等待完成");
    }

    const latestMerge = await this.prisma.pipelineMerge.findFirst({
      where: { pipelineId, stage, invalidatedAt: null },
      orderBy: { mergedAt: "desc" }
    });

    const autoBuildNumber =
      (await this.prisma.build.count({
        where: { pipeline: { appId: pipeline.appId } }
      })) + 1;

    const versionName = dto.versionName?.trim() || null;
    const buildNumber = dto.buildNumber ?? autoBuildNumber;
    const channel = dto.channel?.trim() || null;
    const allowedChannels = (pipeline.app.channels ?? "")
      .split(/[,，]/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (!Number.isInteger(buildNumber) || buildNumber < 1) {
      throw new BadRequestException("Build 号必须是大于 0 的整数");
    }

    if (allowedChannels.length) {
      if (!channel) {
        throw new BadRequestException("请选择渠道");
      }
      if (!allowedChannels.includes(channel)) {
        throw new BadRequestException("渠道不在应用配置的渠道列表中");
      }
    }

    const build = await this.prisma.build.create({
      data: {
        pipelineId,
        stage,
        buildNumber,
        versionName,
        versionCode: dto.buildNumber ? buildNumber : null,
        channel,
        mergeSha: latestMerge?.sha ?? null,
        status: "running",
        progress: 0,
        triggeredBy: user.id
      },
      include: this.buildInclude()
    });

    this.queue.push(build.id);
    void this.drain();

    return this.serialize(build, user.name);
  }

  async listByTask(taskId: string) {
    const builds = await this.prisma.build.findMany({
      where: { pipeline: { taskId } },
      include: this.buildInclude(),
      orderBy: { createdAt: "desc" }
    });

    const names = await this.triggerNames(builds);
    return builds.map((build) => this.serialize(build, this.nameOf(names, build.triggeredBy)));
  }

  async listAll(status?: string) {
    const builds = await this.prisma.build.findMany({
      where: status ? { status } : undefined,
      include: this.buildInclude(),
      orderBy: { createdAt: "desc" }
    });

    const names = await this.triggerNames(builds);
    return builds.map((build) => this.serialize(build, this.nameOf(names, build.triggeredBy)));
  }

  async detail(id: string) {
    const build = await this.prisma.build.findUnique({
      where: { id },
      include: this.buildInclude()
    });

    if (!build) {
      throw new NotFoundException("构建不存在");
    }

    const names = await this.triggerNames([build]);
    return this.serialize(build, this.nameOf(names, build.triggeredBy));
  }

  async log(id: string, offset: number) {
    const build = await this.prisma.build.findUnique({ where: { id } });

    if (!build) {
      throw new NotFoundException("构建不存在");
    }

    if (!build.logPath) {
      return { content: "", nextOffset: 0, size: 0, status: build.status };
    }

    let size = 0;
    try {
      const stat = await fs.stat(build.logPath);
      size = stat.size;
    } catch {
      return { content: "", nextOffset: offset, size: 0, status: build.status };
    }

    const start = Math.min(Math.max(offset, 0), size);
    const length = Math.min(size - start, 64 * 1024);

    if (length <= 0) {
      return { content: "", nextOffset: size, size, status: build.status };
    }

    const handle = await fs.open(build.logPath, "r");
    try {
      const buffer = Buffer.alloc(length);
      await handle.read(buffer, 0, length, start);
      return {
        content: buffer.toString("utf8"),
        nextOffset: start + length,
        size,
        status: build.status
      };
    } finally {
      await handle.close();
    }
  }

  private async drain() {
    if (this.running) return;
    this.running = true;

    try {
      while (this.queue.length > 0) {
        const buildId = this.queue.shift();
        if (!buildId) continue;

        try {
          await this.execute(buildId);
        } catch (error) {
          await this.failBuild(
            buildId,
            error instanceof Error ? error.message : "构建执行异常"
          );
        }
      }
    } finally {
      this.running = false;
    }
  }

  private async execute(buildId: string) {
    const build = await this.prisma.build.findUnique({
      where: { id: buildId },
      include: this.buildInclude()
    });

    if (!build) return;

    const script = build.pipeline.app.buildScript || "./build_app";
    const startedAt = new Date();
    const logPath = path.join(
      storageRoot(),
      "logs",
      build.pipeline.appId,
      `${build.id}.log`
    );

    await fs.mkdir(path.dirname(logPath), { recursive: true });
    await fs.writeFile(logPath, "", "utf8");

    await this.prisma.build.update({
      where: { id: buildId },
      data: { startedAt, logPath }
    });

    await this.appendLog(
      logPath,
      `构建开始 · 流水 ${build.pipeline.name} · 阶段 ${STAGE_LABELS[build.stage]}`
    );
    await this.appendLog(logPath, `工作目录 workspace/${build.pipeline.appId}`);
    await this.appendLog(logPath, `Feature 分支 ${build.pipeline.branch}`);
    await this.appendLog(logPath, `合并提交 ${build.mergeSha ?? "—"}`);
    await this.appendLog(logPath, `构建脚本 ${script}`);
    await this.appendLog(logPath, "检查工作区，必要时克隆仓库");

    try {
      await this.gitService.ensureWorkspace(
        build.pipeline.appId,
        build.pipeline.app.repo,
        build.pipeline.app.defaultBranch
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "克隆仓库失败";
      await this.appendLog(logPath, message, "stderr");
      await this.finishBuild(buildId, logPath, false, 1, message);
      return;
    }

    await this.appendLog(logPath, "执行模式：真实构建（本地 workspace）");
    await this.executeReal(build, buildId, logPath, script);
  }

  private async executeReal(
    build: BuildWithPipeline,
    buildId: string,
    logPath: string,
    script: string
  ) {
    const cwd = this.gitService.workspacePath(build.pipeline.appId);
    const workspace = workspaceRoot();

    await this.appendLog(logPath, `工作区 ${cwd}`);

    const targetBranch = this.targetBranch(
      build.pipeline.app.branchesJson,
      build.stage
    );
    const version = await this.readVersion(cwd);
    const versionName = build.versionName ?? version.versionName ?? "0.0.0";
    const versionCode = build.versionCode ?? version.versionCode ?? build.buildNumber;

    if (versionName !== build.versionName || versionCode !== build.versionCode) {
      await this.prisma.build.update({
        where: { id: buildId },
        data: { versionName, versionCode }
      });
    }

    const env = this.buildEnv(
      build,
      cwd,
      targetBranch,
      versionName,
      versionCode,
      await this.triggerName(build.triggeredBy)
    );

    await this.appendLog(
      logPath,
      `构建参数：VERSION_NAME=${versionName} VERSION_CODE=${versionCode} BUILD_NUMBER=${build.buildNumber} CHANNEL=${build.channel ?? "—"}`
    );
    await this.appendLog(
      logPath,
      `分支参数：STAGE=${build.stage} FEATURE_BRANCH=${build.pipeline.branch} TARGET_BRANCH=${targetBranch}`
    );
    await this.appendLog(
      logPath,
      `需求/任务：${build.pipeline.task.requirement?.code ?? "—"} / ${build.pipeline.task.title}`
    );

    const result = await new Promise<{ code: number; timedOut: boolean }>((resolve) => {
      const child = spawn("bash", ["-lc", script], {
        cwd,
        env
      });

      let lineCount = 0;
      let lastProgress = 5;
      const timeLimit = 30 * 60 * 1000;

      const timeout = setTimeout(() => {
        child.kill("SIGKILL");
      }, timeLimit);

      const handleChunk = (stream: string) => (chunk: Buffer) => {
        const text = chunk
          .toString("utf8")
          .split("\n")
          .filter((line) => line.length > 0);
        for (const line of text) {
          lineCount += 1;
          void this.appendLog(logPath, line, stream);
        }

        const progress = Math.min(90, 10 + lineCount);
        if (progress >= lastProgress + 5) {
          lastProgress = progress;
          void this.prisma.build
            .update({ where: { id: buildId }, data: { progress } })
            .catch(() => {});
        }
      };

      child.stdout?.on("data", handleChunk("stdout"));
      child.stderr?.on("data", handleChunk("stderr"));

      child.on("close", (code) => {
        clearTimeout(timeout);
        resolve({ code: code ?? 1, timedOut: code === null });
      });

      child.on("error", (error) => {
        clearTimeout(timeout);
        void this.appendLog(logPath, `启动构建脚本失败：${error.message}`, "stderr");
        resolve({ code: 1, timedOut: false });
      });
    });

    if (result.code !== 0) {
      await this.finishBuild(
        buildId,
        logPath,
        false,
        result.code,
        result.timedOut ? "构建超时（30 分钟）" : `构建脚本退出码 ${result.code}`
      );
      return;
    }

    await this.appendLog(logPath, "构建脚本执行成功，开始扫描产物");
    const artifacts = await this.collectArtifacts(build, buildId, workspace);
    await this.appendLog(logPath, `产物扫描完成：${artifacts} 个文件入库`);

    await this.finishBuild(buildId, logPath, true, 0, null);
  }

  private async triggerName(userId: string | null): Promise<string> {
    if (!userId) return "";
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });
    return user?.name ?? userId;
  }

  private targetBranch(branchesJson: string, stage: string): string {
    try {
      const branches = JSON.parse(branchesJson) as Record<string, string>;
      return branches[stage] || stage;
    } catch {
      return stage;
    }
  }

  private async readVersion(
    cwd: string
  ): Promise<{ versionName: string | null; versionCode: number | null }> {
    // Flutter 项目优先读取 pubspec.yaml 的 version: x.y.z+build
    try {
      const pubspec = await fs.readFile(path.join(cwd, "pubspec.yaml"), "utf8");
      const match = pubspec.match(/^version:\s*([^\s#]+)/m);
      if (match) {
        const [name, code] = match[1].split("+");
        return {
          versionName: name || null,
          versionCode: code && Number.isFinite(Number(code)) ? Number(code) : null
        };
      }
    } catch {
      // 忽略，继续尝试 package.json
    }

    try {
      const pkg = JSON.parse(
        await fs.readFile(path.join(cwd, "package.json"), "utf8")
      ) as { version?: string };
      if (pkg.version) {
        return { versionName: pkg.version, versionCode: null };
      }
    } catch {
      // 忽略
    }

    return { versionName: null, versionCode: null };
  }

  private buildEnv(
    build: BuildWithPipeline,
    cwd: string,
    targetBranch: string,
    versionName: string,
    versionCode: number,
    triggeredByName: string
  ): NodeJS.ProcessEnv {
    const app = build.pipeline.app;
    const task = build.pipeline.task;
    const requirement = task.requirement;

    const values: Record<string, string> = {
      APP_ID: app.id,
      APP_NAME: app.name,
      APP_CODE: app.code,
      PLATFORM: app.platform,
      PIPELINE_ID: build.pipeline.id,
      PIPELINE_NAME: build.pipeline.name,
      TASK_ID: task.id,
      TASK_TITLE: task.title,
      REQUIREMENT_CODE: requirement?.code ?? "",
      REQUIREMENT_TITLE: requirement?.title ?? "",
      STAGE: build.stage,
      STAGE_LABEL: STAGE_LABELS[build.stage] ?? build.stage,
      FEATURE_BRANCH: build.pipeline.branch,
      TARGET_BRANCH: targetBranch,
      MERGE_SHA: build.mergeSha ?? "",
      BUILD_ID: build.id,
      BUILD_NUMBER: String(build.buildNumber),
      VERSION_NAME: versionName,
      VERSION_CODE: String(versionCode),
      CHANNEL: build.channel ?? "",
      TRIGGERED_BY: triggeredByName,
      WORKSPACE: cwd,
      PROJECT_ROOT: projectRoot()
    };

    const env: NodeJS.ProcessEnv = { ...process.env };

    for (const [key, value] of Object.entries(values)) {
      env[key] = value;
      env[`SHIPFLOW_${key}`] = value;
    }

    return env;
  }

  private async collectArtifacts(
    build: BuildWithPipeline,
    buildId: string,
    workspace: string
  ): Promise<number> {
    const app = build.pipeline.app;
    const patterns = (app.artifactPattern ?? "")
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
    const activePatterns = patterns.length ? patterns : [this.defaultPattern(app.artifactType)];
    const cwd = path.join(workspace, app.id);

    let matches: string[] = [];
    try {
      matches = await fg(activePatterns, {
        cwd,
        onlyFiles: true,
        dot: false,
        followSymbolicLinks: false,
        ignore: ["**/.git/**", "**/node_modules/**"]
      });
    } catch {
      matches = [];
    }

    // 多个扫描规则可能命中同一产物（如 download 与 copy 后的 build），按文件名去重
    const seen = new Set<string>();
    const limited = matches
      .filter((relative) => {
        const name = path.basename(relative);
        if (seen.has(name)) return false;
        seen.add(name);
        return true;
      })
      .slice(0, 20);
    let saved = 0;

    for (const relative of limited) {
      try {
        await this.saveRealArtifact(build, buildId, cwd, relative);
        saved += 1;
      } catch {
        continue;
      }
    }

    return saved;
  }

  private async saveRealArtifact(
    build: BuildWithPipeline,
    buildId: string,
    cwd: string,
    relative: string
  ) {
    const app = build.pipeline.app;
    const source = path.join(cwd, relative);
    const originalName = path.basename(relative);
    const ext = path.extname(originalName).replace(".", "") || app.artifactType;

    const dir = path.join(storageRoot(), "artifacts", app.id, buildId);
    await fs.mkdir(dir, { recursive: true });

    const displayName = this.displayName(
      app.code,
      build.stage,
      build.mergeSha,
      ext,
      dir
    );
    const target = path.join(dir, displayName);

    await fs.copyFile(source, target);

    const stat = await fs.stat(target);
    const sha256 = await this.hashFile(target);

    await this.prisma.artifact.create({
      data: {
        buildId,
        originalName,
        displayName,
        type: ext,
        mimeType: MIME_TYPES[ext] ?? "application/octet-stream",
        sizeBytes: stat.size,
        sha256,
        relativePath: path.posix.join(app.id, buildId, displayName)
      }
    });
  }

  private async hashFile(filePath: string): Promise<string> {
    const hash = createHash("sha256");
    const data = await fs.readFile(filePath);
    hash.update(data);
    return hash.digest("hex");
  }

  private defaultPattern(artifactType: string): string {
    return `**/*.${artifactType}`;
  }

  private displayName(
    appCode: string,
    stage: string,
    mergeSha: string | null,
    ext: string,
    dir: string
  ): string {
    const now = new Date();
    const pad2 = (value: number) => String(value).padStart(2, "0");
    const stamp = `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(
      now.getDate()
    )}_${pad2(now.getHours())}${pad2(now.getMinutes())}${pad2(now.getSeconds())}`;
    const shortSha = (mergeSha ?? "unknown").slice(0, 7);
    const code = appCode.replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 40) || "app";

    let name = `${code}_${stage}_${stamp}_${shortSha}.${ext}`;
    let index = 2;

    // 同名追加序号，避免同一构建内重名覆盖
    while (existsSync(path.join(dir, name))) {
      name = `${code}_${stage}_${stamp}_${shortSha}_${index}.${ext}`;
      index += 1;
    }

    return name;
  }

  private async finishBuild(
    buildId: string,
    logPath: string,
    success: boolean,
    exitCode: number,
    failReason: string | null
  ) {
    const build = await this.prisma.build.findUnique({
      where: { id: buildId },
      include: this.buildInclude()
    });

    if (!build) return;

    const finishedAt = new Date();
    const startedAt = build.startedAt ?? finishedAt;
    const durationMs = finishedAt.getTime() - startedAt.getTime();

    await this.appendLog(
      logPath,
      success ? "构建成功" : `构建失败：${failReason ?? "未知原因"}`,
      success ? "stdout" : "stderr"
    );
    await this.appendLog(logPath, `退出码 ${exitCode} · 耗时 ${durationMs}ms`);

    const finalContent = await fs.readFile(logPath, "utf8");
    const finalSize = Buffer.byteLength(finalContent, "utf8");
    const finalLines = finalContent.split("\n");
    const tail = finalLines.slice(-200).join("\n");

    await this.prisma.build.update({
      where: { id: buildId },
      data: {
        status: success ? "success" : "failed",
        progress: success ? 100 : build.progress,
        finishedAt,
        durationMs,
        exitCode,
        failReason,
        logSizeBytes: finalSize,
        logTail: tail,
        logTruncated: finalLines.length > 200
      }
    });

    const pipeline = build.pipeline;

    if (success && build.stage === "qa") {
      await this.prisma.pipeline.update({
        where: { id: pipeline.id },
        data: { status: "dev_built" }
      });
    }

    await this.prisma.pipelineEvent.create({
      data: {
        pipelineId: pipeline.id,
        type: success ? "build_succeeded" : "build_failed",
        toStatus: success && build.stage === "qa" ? "dev_built" : undefined,
        payloadJson: JSON.stringify({
          stage: build.stage,
          buildId,
          exitCode,
          failReason
        }),
        actorId: build.triggeredBy
      }
    });
  }

  private async failBuild(buildId: string, reason: string) {
    const build = await this.prisma.build.findUnique({ where: { id: buildId } });
    if (!build || build.status !== "running") return;

    await this.prisma.build.update({
      where: { id: buildId },
      data: {
        status: "failed",
        failReason: reason,
        finishedAt: new Date(),
        exitCode: 1,
        durationMs: build.startedAt
          ? Date.now() - build.startedAt.getTime()
          : null
      }
    });
  }

  private async appendLog(logPath: string, message: string, stream = "stdout") {
    const line = `[${nowStamp()}] [${stream}] ${message}\n`;
    await fs.appendFile(logPath, line, "utf8");
  }

  private buildInclude() {
    return {
      pipeline: {
        include: {
          task: {
            select: {
              id: true,
              title: true,
              requirement: { select: { id: true, code: true, title: true } }
            }
          },
          app: {
            select: {
              id: true,
              name: true,
              code: true,
              platform: true,
              repo: true,
              defaultBranch: true,
              artifactType: true,
              artifactPattern: true,
              branchesJson: true,
              buildScript: true
            }
          }
        }
      },
      artifacts: { orderBy: { createdAt: "asc" } }
    } as const;
  }

  private serialize(build: BuildWithPipeline, triggeredByName: string | null = null) {
    return {
      id: build.id,
      pipelineId: build.pipelineId,
      stage: build.stage,
      stageLabel: STAGE_LABELS[build.stage] ?? build.stage,
      buildNumber: build.buildNumber,
      versionName: build.versionName,
      versionCode: build.versionCode,
      channel: build.channel,
      mergeSha: build.mergeSha,
      status: build.status,
      statusLabel: BUILD_STATUS_LABELS[build.status] ?? build.status,
      progress: build.progress,
      startedAt: build.startedAt,
      finishedAt: build.finishedAt,
      durationMs: build.durationMs,
      exitCode: build.exitCode,
      failReason: build.failReason,
      logSizeBytes: build.logSizeBytes,
      triggeredBy: build.triggeredBy,
      triggeredByName,
      createdAt: build.createdAt,
      pipeline: {
        id: build.pipeline.id,
        name: build.pipeline.name,
        branch: build.pipeline.branch,
        app: build.pipeline.app
      },
      artifacts: build.artifacts.map((artifact) => ({
        id: artifact.id,
        displayName: artifact.displayName,
        originalName: artifact.originalName,
        type: artifact.type,
        mimeType: artifact.mimeType,
        sizeBytes: artifact.sizeBytes,
        status: artifact.status,
        downloadCount: artifact.downloadCount,
        createdAt: artifact.createdAt
      }))
    };
  }

  private async triggerNames(
    builds: { triggeredBy: string | null }[]
  ): Promise<Map<string, string>> {
    const ids = Array.from(
      new Set(
        builds
          .map((build) => build.triggeredBy)
          .filter((value): value is string => Boolean(value))
      )
    );

    if (ids.length === 0) return new Map();

    const users = await this.prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true }
    });

    return new Map(users.map((user) => [user.id, user.name]));
  }

  private nameOf(names: Map<string, string>, userId: string | null): string | null {
    if (!userId) return null;
    return names.get(userId) ?? null;
  }
}
