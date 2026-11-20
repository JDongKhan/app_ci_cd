import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit
} from "@nestjs/common";
import { promises as fs } from "node:fs";
import { createHash } from "node:crypto";
import * as path from "node:path";
import { AuthUser } from "../common/auth-user.interface";
import { storageRoot } from "../common/storage";
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
      artifactType: string;
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

  constructor(private readonly prisma: PrismaService) {}

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

    const shouldFail = script.toLowerCase().includes("fail");

    const steps: { message: string; progress: number }[] = [
      { message: "准备构建环境", progress: 10 },
      { message: `拉取代码 ${build.pipeline.branch}`, progress: 24 },
      { message: "校验合并提交", progress: 36 },
      { message: `执行构建脚本：${script}`, progress: 52 },
      { message: "扫描产物", progress: 78 },
      { message: "构建完成", progress: 100 }
    ];

    for (const step of steps) {
      await sleep(500);

      if (shouldFail && step.progress === 52) {
        await this.appendLog(logPath, `执行失败：${script} 退出码 1`, "stderr");
        await this.finishBuild(buildId, logPath, false, 1, "构建脚本执行失败（exit code 1）");
        return;
      }

      await this.appendLog(logPath, step.message);
      await this.prisma.build.update({
        where: { id: buildId },
        data: { progress: step.progress }
      });
    }

    await this.finishBuild(buildId, logPath, true, 0, null);
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

    if (success) {
      await this.createArtifact(build, buildId);
    }

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

  private async createArtifact(build: BuildWithPipeline, buildId: string) {
    const app = build.pipeline.app;
    const dir = path.join(storageRoot(), "artifacts", app.id, buildId);
    await fs.mkdir(dir, { recursive: true });

    const now = new Date();
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(
      now.getHours()
    )}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const shortSha = (build.mergeSha ?? "unknown").slice(0, 7);
    const appCode =
      app.code.replace(/[^a-zA-Z0-9_-]+/g, "_").slice(0, 40) || "app";
    const ext = app.artifactType;
    const displayName = `${appCode}_${build.stage}_${stamp}_${shortSha}.${ext}`;

    const content = Buffer.from(
      [
        "ShipFlow simulated artifact",
        `app: ${app.name}`,
        `stage: ${build.stage}`,
        `build: ${buildId}`,
        `sha: ${build.mergeSha ?? "-"}`,
        `created: ${now.toISOString()}`
      ].join("\n") + "\n",
      "utf8"
    );

    const filePath = path.join(dir, displayName);
    await fs.writeFile(filePath, content);

    const sha256 = createHash("sha256").update(content).digest("hex");
    const relativePath = path.posix.join(app.id, buildId, displayName);

    await this.prisma.artifact.create({
      data: {
        buildId,
        originalName: displayName,
        displayName,
        type: ext,
        mimeType: MIME_TYPES[ext] ?? "application/octet-stream",
        sizeBytes: content.length,
        sha256,
        relativePath
      }
    });
  }

  private async failBuild(buildId: string, reason: string) {    const build = await this.prisma.build.findUnique({ where: { id: buildId } });
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
              artifactType: true,
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
