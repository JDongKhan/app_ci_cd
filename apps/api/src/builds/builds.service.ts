import {
  BadRequestException,
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
import { storageRoot, workspaceRoot } from "../common/storage";
import { PrismaService } from "../prisma/prisma.service";

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
    app: {
      id: string;
      name: string;
      code: string;
      platform: string;
      repo: string;
      defaultBranch: string;
      artifactType: string;
      artifactPattern: string | null;
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

  async trigger(pipelineId: string, user: AuthUser) {
    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id: pipelineId },
      include: { app: true }
    });

    if (!pipeline) {
      throw new NotFoundException("流水不存在");
    }

    const stage = this.stageForStatus(pipeline.status);
    if (!stage) {
      throw new BadRequestException("当前流水状态不能打包");
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

    const build = await this.prisma.build.create({
      data: {
        pipelineId,
        stage,
        mergeSha: latestMerge?.sha ?? null,
        status: "running",
        progress: 0,
        triggeredBy: user.id
      },
      include: this.buildInclude()
    });

    this.queue.push(build.id);
    void this.drain();

    return this.serialize(build);
  }

  async listByTask(taskId: string) {
    const builds = await this.prisma.build.findMany({
      where: { pipeline: { taskId } },
      include: this.buildInclude(),
      orderBy: { createdAt: "desc" }
    });

    return builds.map((build) => this.serialize(build));
  }

  async listAll(status?: string) {
    const builds = await this.prisma.build.findMany({
      where: status ? { status } : undefined,
      include: this.buildInclude(),
      orderBy: { createdAt: "desc" }
    });

    return builds.map((build) => this.serialize(build));
  }

  async detail(id: string) {
    const build = await this.prisma.build.findUnique({
      where: { id },
      include: this.buildInclude()
    });

    if (!build) {
      throw new NotFoundException("构建不存在");
    }

    return this.serialize(build);
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

    const result = await new Promise<{ code: number; timedOut: boolean }>((resolve) => {
      const child = spawn("bash", ["-lc", script], {
        cwd,
        env: process.env
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

  private async collectArtifacts(
    build: BuildWithPipeline,
    buildId: string,
    workspace: string
  ): Promise<number> {
    const app = build.pipeline.app;
    const pattern =
      app.artifactPattern?.trim() || this.defaultPattern(app.artifactType);
    const cwd = path.join(workspace, app.id);

    let matches: string[] = [];
    try {
      matches = await fg(pattern, {
        cwd,
        onlyFiles: true,
        dot: false,
        followSymbolicLinks: false,
        ignore: ["**/.git/**", "**/node_modules/**"]
      });
    } catch {
      matches = [];
    }

    const limited = matches.slice(0, 20);
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

  private stageForStatus(status: string): BuildStage | null {
    if (status === "dev_merged" || status === "dev_built") return "qa";
    if (status === "testing") return "uat";
    if (status === "release_check") return "release";
    return null;
  }

  private buildInclude() {
    return {
      pipeline: {
        include: {
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
              buildScript: true
            }
          }
        }
      },
      artifacts: { orderBy: { createdAt: "asc" } }
    } as const;
  }

  private serialize(build: BuildWithPipeline) {
    return {
      id: build.id,
      pipelineId: build.pipelineId,
      stage: build.stage,
      stageLabel: STAGE_LABELS[build.stage] ?? build.stage,
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
}
