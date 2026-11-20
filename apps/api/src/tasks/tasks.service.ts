import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { promisify } from "node:util";
import { Prisma } from "@prisma/client";
import { AuthUser } from "../common/auth-user.interface";
import { averageProgress } from "../common/pipeline-status";
import { workspaceRoot } from "../common/storage";
import { PrismaService } from "../prisma/prisma.service";
import { taskOverdueType, taskStatusLabel } from "../common/task-status";
import { PipelinesService } from "../pipelines/pipelines.service";
import { CreateTaskDto, UpdateTaskDto } from "./dto/task.dto";

const execFileAsync = promisify(execFile);

const PERSON_SELECT = {
  id: true,
  account: true,
  name: true,
  role: true,
  level: true
} as const;

const TASK_DETAIL_INCLUDE = {
  owner: { select: PERSON_SELECT },
  requirement: {
    select: { id: true, code: true, title: true }
  },
  pipelines: {
    include: { merges: true },
    orderBy: { createdAt: "asc" }
  }
} as const;

type TaskWithRelations = Prisma.TaskGetPayload<{
  include: typeof TASK_DETAIL_INCLUDE;
}>;

const STATUS_FLOW: Record<string, string> = {
  none: "dev",
  dev: "ready",
  ready: "testing",
  testing: "release",
  release: "done"
};

const STATUS_ACTOR: Record<string, string> = {
  dev: "dev",
  ready: "dev",
  testing: "qa",
  release: "qa",
  done: "qa"
};

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pipelinesService: PipelinesService
  ) {}

  async detail(id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, deletedAt: null },
      include: TASK_DETAIL_INCLUDE
    });

    if (!task) {
      throw new NotFoundException("任务不存在");
    }

    return await this.sanitizeDetail(task);  }

  async listByRequirement(reqId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { reqId, deletedAt: null },
      include: {
        owner: { select: PERSON_SELECT },
        requirement: { select: { id: true, code: true, title: true } },
        pipelines: { include: { merges: true } }
      },
      orderBy: { createdAt: "asc" }
    });

    return tasks.map((task) => this.sanitizeSummary(task));
  }

  async myTasks(user: AuthUser) {
    const where: Prisma.TaskWhereInput = { deletedAt: null };

    if (user.role === "dev") {
      where.ownerId = user.id;
    } else if (user.role === "qa") {
      where.requirement = {
        OR: [
          { qaOwnerId: user.id },
          { qaMembers: { some: { userId: user.id } } }
        ]
      };
    }

    const tasks = await this.prisma.task.findMany({
      where,
      include: {
        owner: { select: PERSON_SELECT },
        requirement: { select: { id: true, code: true, title: true } },
        pipelines: { include: { merges: true } }
      },
      orderBy: [{ dueAt: "asc" }, { createdAt: "asc" }]
    });

    return tasks.map((task) => this.sanitizeSummary(task));
  }

  async board() {
    const tasks = await this.prisma.task.findMany({
      where: { deletedAt: null },
      include: {
        owner: { select: PERSON_SELECT },
        requirement: { select: { id: true, code: true, title: true } },
        pipelines: { include: { merges: true } }
      },
      orderBy: [{ dueAt: "asc" }, { createdAt: "asc" }]
    });

    return tasks.map((task) => this.sanitizeSummary(task));
  }

  async commits(id: string, limit = 20) {
    const task = await this.prisma.task.findFirst({
      where: { id, deletedAt: null },
      include: {
        pipelines: { include: { app: true }, orderBy: { createdAt: "asc" } }
      }
    });

    if (!task) {
      throw new NotFoundException("任务不存在");
    }

    const pipeline = task.pipelines[0];
    if (!pipeline) return [];

    const repoDir = path.join(workspaceRoot(), pipeline.appId);

    try {
      await fs.access(path.join(repoDir, ".git"));
    } catch {
      return [];
    }

    try {
      const { stdout } = await execFileAsync(
        "git",
        [
          "-C",
          repoDir,
          "log",
          pipeline.branch,
          `-n${Math.min(Math.max(limit, 1), 50)}`,
          "--pretty=format:%H%x1f%an%x1f%aI%x1f%s"
        ],
        { maxBuffer: 1024 * 1024 }
      );

      return stdout
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const [sha, author, date, message] = line.split("\x1f");
          return { sha, author, date, message };
        });
    } catch {
      return [];
    }
  }

  async create(dto: CreateTaskDto) {
    const requirement = await this.prisma.requirement.findUnique({
      where: { id: dto.reqId }
    });

    if (!requirement) {
      throw new BadRequestException("需求不存在");
    }

    const ownerId = dto.ownerId || requirement.devOwnerId;
    await this.assertActiveDev(ownerId);

    const task = await this.prisma.task.create({
      data: {
        reqId: requirement.id,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        ownerId,
        priority: dto.priority || requirement.priority,
        startAt: new Date(dto.startAt),
        dueAt: new Date(dto.dueAt)
      },
      include: TASK_DETAIL_INCLUDE
    });

    return await this.sanitizeDetail(task);  }

  async update(id: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findFirst({
      where: { id, deletedAt: null }
    });

    if (!task) {
      throw new NotFoundException("任务不存在");
    }

    if (dto.ownerId && dto.ownerId !== task.ownerId) {
      await this.assertActiveDev(dto.ownerId);
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        ownerId: dto.ownerId || task.ownerId,
        priority: dto.priority || task.priority,
        startAt: new Date(dto.startAt),
        dueAt: new Date(dto.dueAt)
      },
      include: TASK_DETAIL_INCLUDE
    });

    return await this.sanitizeDetail(updated);
  }

  async remove(id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, deletedAt: null }
    });

    if (!task) {
      throw new NotFoundException("任务不存在");
    }

    await this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return { ok: true };
  }

  async advanceStatus(id: string, status: string, user: AuthUser) {
    const task = await this.prisma.task.findFirst({
      where: { id, deletedAt: null },
      include: { pipelines: true }
    });

    if (!task) {
      throw new NotFoundException("任务不存在");
    }

    const expected = STATUS_FLOW[task.status];
    if (!expected || expected !== status) {
      throw new BadRequestException("任务状态只能按顺序推进");
    }

    const actorRole = STATUS_ACTOR[status];
    if (user.role !== "admin" && user.role !== actorRole) {
      throw new ForbiddenException(
        actorRole === "dev" ? "该步骤只能由开发执行" : "该步骤只能由测试执行"
      );
    }

    await this.assertStatusGate(id, task.status, status);

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        status,
        statusAt: new Date(),
        statusBy: user.id,
        finishedAt: status === "done" ? new Date() : task.finishedAt
      },
      include: TASK_DETAIL_INCLUDE
    });

    return await this.sanitizeDetail(updated);
  }

  private async assertStatusGate(taskId: string, from: string, to: string) {
    if (to === "dev") return;

    const pipelines = await this.prisma.pipeline.findMany({
      where: { taskId },
      select: { status: true }
    });

    if (to === "ready" || to === "testing") {
      const passed = pipelines.some((pipeline) => pipeline.status === "dev_passed");
      if (!passed) {
        throw new BadRequestException("至少需要一条流水完成自测通过");
      }
      return;
    }

    if (to === "release") {
      const uatReady = pipelines.some((pipeline) => pipeline.status === "testing");
      if (!uatReady) {
        throw new BadRequestException("至少需要一条流水完成 UAT 合并");
      }
      return;
    }

    if (to === "done") {
      const finished = pipelines.some((pipeline) =>
        ["release_verified", "done"].includes(pipeline.status)
      );
      if (!finished) {
        throw new BadRequestException("至少需要一条流水验证通过或已合入 master");
      }
    }
  }

  private async assertActiveDev(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "dev" || !user.active) {
      throw new BadRequestException("任务负责人必须是启用的开发人员");
    }
  }

  private async sanitizeDetail(task: TaskWithRelations) {
    const overdueType = taskOverdueType(task);
    const pipelines = await this.pipelinesService.listByTask(task.id);

    return {
      ...this.sanitizeSummary(task),
      description: task.description ?? "",
      overdueType,
      requirement: task.requirement,
      statusAt: task.statusAt,
      statusBy: task.statusBy,
      finishedAt: task.finishedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      pipelineCount: pipelines.length,
      pipelines
    };
  }

  private sanitizeSummary(task: {
    id: string;
    reqId: string;
    title: string;
    owner: {
      id: string;
      account: string;
      name: string;
      role: string;
      level: string | null;
    };
    priority: string;
    status: string;
    startAt: Date;
    dueAt: Date;
    requirement?: { id: string; code: string; title: string };
    pipelines?: { merges: { stage: string; invalidatedAt: Date | null }[] }[];
  }) {
    const pipelines = task.pipelines ?? [];

    return {
      id: task.id,
      reqId: task.reqId,
      title: task.title,
      owner: task.owner,
      requirement: task.requirement,
      priority: task.priority,
      status: task.status,
      statusLabel: taskStatusLabel(task.status),
      startAt: task.startAt,
      dueAt: task.dueAt,
      overdueType: taskOverdueType(task),
      pipelineCount: pipelines.length,
      progress: averageProgress(pipelines)
    };
  }
}
