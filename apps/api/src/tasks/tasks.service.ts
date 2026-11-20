import {
  BadRequestException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { taskOverdueType, taskStatusLabel } from "../common/task-status";
import { CreateTaskDto, UpdateTaskDto } from "./dto/task.dto";

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
  }
} as const;

type TaskWithRelations = Prisma.TaskGetPayload<{
  include: typeof TASK_DETAIL_INCLUDE;
}>;

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async detail(id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, deletedAt: null },
      include: TASK_DETAIL_INCLUDE
    });

    if (!task) {
      throw new NotFoundException("任务不存在");
    }

    return this.sanitizeDetail(task);
  }

  async listByRequirement(reqId: string) {
    const tasks = await this.prisma.task.findMany({
      where: { reqId, deletedAt: null },
      include: { owner: { select: PERSON_SELECT } },
      orderBy: { createdAt: "asc" }
    });

    return tasks.map((task) => this.sanitizeSummary(task));
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

    return this.sanitizeDetail(task);
  }

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

    return this.sanitizeDetail(updated);
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

  private async assertActiveDev(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "dev" || !user.active) {
      throw new BadRequestException("任务负责人必须是启用的开发人员");
    }
  }

  private sanitizeDetail(task: TaskWithRelations) {
    const overdueType = taskOverdueType(task);

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
      pipelineCount: 0,
      pipelines: []
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
  }) {
    return {
      id: task.id,
      reqId: task.reqId,
      title: task.title,
      owner: task.owner,
      priority: task.priority,
      status: task.status,
      statusLabel: taskStatusLabel(task.status),
      startAt: task.startAt,
      dueAt: task.dueAt,
      overdueType: taskOverdueType(task),
      pipelineCount: 0,
      progress: 0
    };
  }
}
