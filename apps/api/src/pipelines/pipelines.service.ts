import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { randomBytes } from "node:crypto";
import { AuthUser } from "../common/auth-user.interface";
import {
  CONFLICT_FILES,
  MERGE_PLAN,
  MergeStage,
  pipelineProgress,
  pipelineStatusLabel
} from "../common/pipeline-status";
import { PrismaService } from "../prisma/prisma.service";
import { BuildsService } from "../builds/builds.service";
import { CreatePipelineDto } from "./dto/pipeline.dto";

const PIPELINE_INCLUDE = {
  app: true,
  merges: { orderBy: { mergedAt: "asc" } },
  conflicts: {
    orderBy: { createdAt: "asc" },
    include: { files: true }
  },
  events: { orderBy: { createdAt: "asc" } }
} as const;

type PipelineWithRelations = {
  id: string;
  taskId: string;
  appId: string;
  name: string;
  branch: string;
  status: string;
  reworkFrom: string | null;
  reworkReason: string | null;
  reworkBy: string | null;
  reworkAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  app: {
    id: string;
    name: string;
    platform: string;
    artifactType: string;
    repo: string;
    branchesJson: string;
  };
  merges: {
    id: string;
    stage: string;
    fromBranch: string;
    toBranch: string;
    sha: string;
    commits: number;
    operatorId: string | null;
    mergedAt: Date;
    invalidatedAt: Date | null;
    invalidatedReason: string | null;
  }[];
  conflicts: {
    id: string;
    stage: string;
    tempBranch: string;
    createdAt: Date;
    resolvedAt: Date | null;
    resolvedBy: string | null;
    files: { id: string; path: string }[];
  }[];
  events: {
    id: string;
    type: string;
    fromStatus: string | null;
    toStatus: string | null;
    payloadJson: string | null;
    actorId: string | null;
    createdAt: Date;
  }[];
};

@Injectable()
export class PipelinesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly buildsService: BuildsService
  ) {}

  async listByTask(taskId: string) {
    const pipelines = await this.prisma.pipeline.findMany({
      where: { taskId },
      include: PIPELINE_INCLUDE,
      orderBy: { createdAt: "asc" }
    });

    return pipelines.map((pipeline) => this.serialize(pipeline));
  }

  async create(taskId: string, dto: CreatePipelineDto) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, deletedAt: null }
    });

    if (!task) {
      throw new NotFoundException("任务不存在");
    }

    if (task.status === "done") {
      throw new BadRequestException("已结束的任务不能再新建流水");
    }

    const app = await this.prisma.app.findUnique({ where: { id: dto.appId } });
    if (!app) {
      throw new BadRequestException("应用不存在");
    }

    const branch = dto.branch.trim();

    const existing = await this.prisma.pipeline.findMany({
      where: { taskId },
      include: { app: true },
      orderBy: { createdAt: "asc" }
    });

    if (existing.length > 0) {
      const first = existing[0];
      if (first.branch !== branch) {
        throw new BadRequestException("同一任务下所有流水必须使用相同的 Feature 分支");
      }
      if (first.app.repo !== app.repo) {
        throw new BadRequestException("同一任务下所有流水必须使用相同的仓库");
      }
    }

    const duplicated = await this.prisma.pipeline.findUnique({
      where: { taskId_appId_branch: { taskId, appId: dto.appId, branch } }
    });

    if (duplicated) {
      throw new ConflictException("该任务下已存在同应用、同分支的流水");
    }

    const pipeline = await this.prisma.pipeline.create({
      data: {
        taskId,
        appId: app.id,
        name: dto.name?.trim() || `${app.name} · ${app.artifactType}`,
        branch
      },
      include: PIPELINE_INCLUDE
    });

    return this.serialize(pipeline);
  }

  async merge(id: string, stage: MergeStage, user: AuthUser) {
    const plan = MERGE_PLAN[stage];
    if (!plan) {
      throw new BadRequestException("合并阶段不合法");
    }

    await this.assertPermission(user, plan.permission);

    if (this.buildsService.isBusy()) {
      throw new BadRequestException("打包机正在构建，此时禁止切分支合并");
    }

    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id },
      include: { app: true, task: true }
    });

    if (!pipeline) {
      throw new NotFoundException("流水不存在");
    }

    if (pipeline.task.deletedAt) {
      throw new BadRequestException("任务已删除");
    }

    if (pipeline.task.status !== plan.taskStatus) {
      throw new BadRequestException(
        `当前任务状态为「${pipeline.task.status}」，${plan.label}要求任务处于指定的前置状态`
      );
    }

    if (!plan.allowedFrom.includes(pipeline.status)) {
      throw new BadRequestException(`当前流水状态不能执行「${plan.label}」`);
    }

    const toBranch = this.targetBranch(pipeline.app.branchesJson, stage);

    await this.prisma.pipelineEvent.create({
      data: {
        pipelineId: id,
        type: "merge_started",
        fromStatus: pipeline.status,
        toStatus: plan.busy,
        payloadJson: JSON.stringify({ stage, toBranch }),
        actorId: user.id
      }
    });

    const hasConflict = pipeline.branch.toLowerCase().includes("conflict");

    if (hasConflict) {
      const tempBranch = this.tempBranchName(toBranch, pipeline.branch);

      await this.prisma.pipeline.update({
        where: { id },
        data: { status: plan.conflict }
      });

      await this.prisma.pipelineConflict.create({
        data: {
          pipelineId: id,
          stage,
          tempBranch,
          files: {
            create: CONFLICT_FILES[stage].map((path) => ({ path }))
          }
        }
      });

      await this.prisma.pipelineEvent.create({
        data: {
          pipelineId: id,
          type: "merge_conflict",
          fromStatus: plan.busy,
          toStatus: plan.conflict,
          payloadJson: JSON.stringify({ stage, tempBranch, files: CONFLICT_FILES[stage] }),
          actorId: user.id
        }
      });
    } else {
      await this.prisma.pipeline.update({
        where: { id },
        data: {
          status: plan.success,
          reworkFrom: null,
          reworkReason: null,
          reworkBy: null,
          reworkAt: null
        }
      });

      await this.prisma.pipelineMerge.create({
        data: {
          pipelineId: id,
          stage,
          fromBranch: pipeline.branch,
          toBranch,
          sha: this.randomSha(),
          commits: 1 + Math.floor(Math.random() * 3),
          operatorId: user.id
        }
      });

      await this.prisma.pipelineEvent.create({
        data: {
          pipelineId: id,
          type: "merge_succeeded",
          fromStatus: plan.busy,
          toStatus: plan.success,
          payloadJson: JSON.stringify({ stage, toBranch }),
          actorId: user.id
        }
      });
    }

    return this.detail(id);
  }

  async resolve(id: string, user: AuthUser) {
    if (this.buildsService.isBusy()) {
      throw new BadRequestException("打包机正在构建，此时禁止切分支合并");
    }

    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id },
      include: { app: true, conflicts: { where: { resolvedAt: null }, orderBy: { createdAt: "desc" } } }
    });

    if (!pipeline) {
      throw new NotFoundException("流水不存在");
    }

    const stage = this.stageFromStatus(pipeline.status);
    if (!stage) {
      throw new BadRequestException("当前流水没有待解决的冲突");
    }

    const plan = MERGE_PLAN[stage];
    await this.assertPermission(user, plan.permission);

    const conflict = pipeline.conflicts[0];
    if (!conflict) {
      throw new BadRequestException("当前流水没有待解决的冲突");
    }

    const toBranch = this.targetBranch(pipeline.app.branchesJson, stage);

    await this.prisma.$transaction([
      this.prisma.pipelineConflict.update({
        where: { id: conflict.id },
        data: { resolvedAt: new Date(), resolvedBy: user.id }
      }),
      this.prisma.pipeline.update({
        where: { id },
        data: { status: plan.success }
      }),
      this.prisma.pipelineMerge.create({
        data: {
          pipelineId: id,
          stage,
          fromBranch: conflict.tempBranch,
          toBranch,
          sha: this.randomSha(),
          commits: 1,
          operatorId: user.id
        }
      }),
      this.prisma.pipelineEvent.create({
        data: {
          pipelineId: id,
          type: "conflict_resolved",
          fromStatus: pipeline.status,
          toStatus: plan.success,
          payloadJson: JSON.stringify({ stage, tempBranch: conflict.tempBranch }),
          actorId: user.id
        }
      })
    ]);

    return this.detail(id);
  }

  async qaVerdict(id: string, pass: boolean, reason: string | undefined, user: AuthUser) {
    await this.assertPermission(user, "build_run");

    const pipeline = await this.prisma.pipeline.findUnique({ where: { id } });
    if (!pipeline) {
      throw new NotFoundException("流水不存在");
    }

    if (pipeline.status !== "dev_built") {
      throw new BadRequestException("只有 QA 包就绪的流水才能做自测判定");
    }

    if (pass) {
      await this.prisma.pipeline.update({
        where: { id },
        data: { status: "dev_passed" }
      });
      await this.prisma.pipelineEvent.create({
        data: {
          pipelineId: id,
          type: "qa_passed",
          fromStatus: "dev_built",
          toStatus: "dev_passed",
          actorId: user.id
        }
      });
    } else {
      const merge = await this.prisma.pipelineMerge.findFirst({
        where: { pipelineId: id, stage: "qa", invalidatedAt: null },
        orderBy: { mergedAt: "desc" }
      });

      if (merge) {
        await this.prisma.pipelineMerge.update({
          where: { id: merge.id },
          data: {
            invalidatedAt: new Date(),
            invalidatedReason: reason?.trim() || "自测拒绝"
          }
        });
      }

      await this.prisma.pipeline.update({
        where: { id },
        data: {
          status: "dev_merged",
          reworkFrom: "qa",
          reworkReason: reason?.trim() || "自测拒绝",
          reworkBy: user.id,
          reworkAt: new Date()
        }
      });

      await this.prisma.pipelineEvent.create({
        data: {
          pipelineId: id,
          type: "qa_rejected",
          fromStatus: "dev_built",
          toStatus: "dev_merged",
          payloadJson: JSON.stringify({ reason: reason?.trim() || "自测拒绝" }),
          actorId: user.id
        }
      });
    }

    return this.detail(id);
  }

  async testReject(id: string, reason: string | undefined, user: AuthUser) {
    await this.assertPermission(user, "test_run");

    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id },
      include: { task: true }
    });

    if (!pipeline) {
      throw new NotFoundException("流水不存在");
    }

    if (pipeline.status !== "testing" || pipeline.task.status !== "testing") {
      throw new BadRequestException("只有测试中的流水才能执行测试不通过");
    }

    const now = new Date();
    const text = reason?.trim() || "测试不通过";

    await this.prisma.pipelineMerge.updateMany({
      where: {
        pipelineId: id,
        stage: { in: ["uat", "release"] },
        invalidatedAt: null
      },
      data: { invalidatedAt: now, invalidatedReason: text }
    });

    await this.prisma.$transaction([
      this.prisma.pipeline.update({
        where: { id },
        data: {
          status: "dev_merged",
          reworkFrom: "testing",
          reworkReason: text,
          reworkBy: user.id,
          reworkAt: now
        }
      }),
      this.prisma.task.update({
        where: { id: pipeline.taskId },
        data: { status: "dev", statusAt: now, statusBy: user.id }
      }),
      this.prisma.pipelineEvent.create({
        data: {
          pipelineId: id,
          type: "test_rejected",
          fromStatus: "testing",
          toStatus: "dev_merged",
          payloadJson: JSON.stringify({ reason: text }),
          actorId: user.id
        }
      })
    ]);

    return this.detail(id);
  }

  async verify(id: string, pass: boolean, reason: string | undefined, user: AuthUser) {
    await this.assertPermission(user, "verify");

    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id },
      include: { task: true }
    });

    if (!pipeline) {
      throw new NotFoundException("流水不存在");
    }

    if (pipeline.status !== "release_check" || pipeline.task.status !== "release") {
      throw new BadRequestException("只有 Release 验证中的流水才能做发布验证");
    }

    const now = new Date();
    const text = reason?.trim();

    if (pass) {
      await this.prisma.$transaction([
        this.prisma.pipeline.update({
          where: { id },
          data: { status: "release_verified" }
        }),
        this.prisma.pipelineEvent.create({
          data: {
            pipelineId: id,
            type: "release_verified",
            fromStatus: "release_check",
            toStatus: "release_verified",
            actorId: user.id
          }
        })
      ]);
    } else {
      await this.prisma.pipelineMerge.updateMany({
        where: { pipelineId: id, stage: "release", invalidatedAt: null },
        data: { invalidatedAt: now, invalidatedReason: text || "Release 验证不通过" }
      });

      await this.prisma.$transaction([
        this.prisma.pipeline.update({
          where: { id },
          data: {
            status: "testing",
            reworkFrom: "release",
            reworkReason: text || "Release 验证不通过",
            reworkBy: user.id,
            reworkAt: now
          }
        }),
        this.prisma.task.update({
          where: { id: pipeline.taskId },
          data: { status: "testing", statusAt: now, statusBy: user.id }
        }),
        this.prisma.pipelineEvent.create({
          data: {
            pipelineId: id,
            type: "release_rejected",
            fromStatus: "release_check",
            toStatus: "testing",
            payloadJson: JSON.stringify({ reason: text || "Release 验证不通过" }),
            actorId: user.id
          }
        })
      ]);
    }

    return this.detail(id);
  }

  async detail(id: string) {
    const pipeline = await this.prisma.pipeline.findUnique({
      where: { id },
      include: PIPELINE_INCLUDE
    });

    if (!pipeline) {
      throw new NotFoundException("流水不存在");
    }

    return this.serialize(pipeline);
  }

  private serialize(pipeline: PipelineWithRelations) {
    return {
      id: pipeline.id,
      taskId: pipeline.taskId,
      appId: pipeline.appId,
      name: pipeline.name,
      branch: pipeline.branch,
      status: pipeline.status,
      statusLabel: pipelineStatusLabel(pipeline.status),
      progress: pipelineProgress(pipeline.merges),
      app: {
        id: pipeline.app.id,
        name: pipeline.app.name,
        platform: pipeline.app.platform,
        artifactType: pipeline.app.artifactType,
        repo: pipeline.app.repo,
        branches: this.parseBranches(pipeline.app.branchesJson)
      },
      rework: pipeline.reworkFrom
        ? {
            from: pipeline.reworkFrom,
            reason: pipeline.reworkReason,
            by: pipeline.reworkBy,
            at: pipeline.reworkAt
          }
        : null,
      merges: pipeline.merges.map((merge) => ({
        id: merge.id,
        stage: merge.stage,
        fromBranch: merge.fromBranch,
        toBranch: merge.toBranch,
        sha: merge.sha,
        commits: merge.commits,
        operatorId: merge.operatorId,
        mergedAt: merge.mergedAt,
        invalidatedAt: merge.invalidatedAt,
        invalidatedReason: merge.invalidatedReason
      })),
      conflicts: pipeline.conflicts.map((conflict) => ({
        id: conflict.id,
        stage: conflict.stage,
        tempBranch: conflict.tempBranch,
        createdAt: conflict.createdAt,
        resolvedAt: conflict.resolvedAt,
        resolvedBy: conflict.resolvedBy,
        files: conflict.files.map((file) => file.path)
      })),
      events: pipeline.events.map((event) => ({
        id: event.id,
        type: event.type,
        fromStatus: event.fromStatus,
        toStatus: event.toStatus,
        payload: event.payloadJson ? JSON.parse(event.payloadJson) : null,
        actorId: event.actorId,
        createdAt: event.createdAt
      })),
      createdAt: pipeline.createdAt,
      updatedAt: pipeline.updatedAt
    };
  }

  private async assertPermission(user: AuthUser, permissionKey: string) {
    if (user.role === "admin") return;

    if (!user.level) {
      throw new ForbiddenException("没有该操作权限");
    }

    const row = await this.prisma.rolePermission.findFirst({
      where: { role: user.role, level: user.level, permissionKey }
    });

    if (!row) {
      throw new ForbiddenException("没有该操作权限");
    }
  }

  private stageFromStatus(status: string): MergeStage | null {
    for (const stage of Object.keys(MERGE_PLAN) as MergeStage[]) {
      if (MERGE_PLAN[stage].conflict === status) return stage;
    }
    return null;
  }

  private parseBranches(value: string): Record<string, string> {
    try {
      return JSON.parse(value) as Record<string, string>;
    } catch {
      return { qa: "qa", uat: "uat", release: "release", master: "master" };
    }
  }

  private targetBranch(branchesJson: string, stage: MergeStage): string {
    const branches = this.parseBranches(branchesJson);
    return branches[stage] || stage;
  }

  private randomSha(): string {
    return randomBytes(20).toString("hex");
  }

  private tempBranchName(toBranch: string, feature: string): string {
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, "0");
    const stamp = `${String(now.getFullYear()).slice(2)}.${pad(now.getMonth() + 1)}${pad(
      now.getDate()
    )}.${pad(now.getHours())}${pad(now.getMinutes())}.${pad(now.getSeconds())}`;
    const slug = feature.replace(/^feature\//, "").replace(/[^a-zA-Z0-9_-]+/g, "-") || "feature";
    return `temp/Conflict_${toBranch}_feature/${slug}_${stamp}`;
  }
}
