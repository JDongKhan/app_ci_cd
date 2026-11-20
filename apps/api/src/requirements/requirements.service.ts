import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { AuthUser } from "../common/auth-user.interface";
import {
  summarizeRequirement,
  taskOverdueType,
  taskStatusLabel
} from "../common/task-status";
import { PrismaService } from "../prisma/prisma.service";
import { CreateRequirementDto, UpdateRequirementDto } from "./dto/requirement.dto";

const PERSON_SELECT = {
  id: true,
  account: true,
  name: true,
  role: true,
  level: true
} as const;

const REQUIREMENT_INCLUDE = {
  devOwner: { select: PERSON_SELECT },
  qaOwner: { select: PERSON_SELECT },
  pmOwner: { select: PERSON_SELECT },
  qaMembers: {
    include: { user: { select: PERSON_SELECT } },
    orderBy: { userId: "asc" }
  },
  tasks: {
    where: { deletedAt: null },
    include: { owner: { select: PERSON_SELECT } },
    orderBy: { createdAt: "asc" }
  }
} as const;

type RequirementWithPeople = Prisma.RequirementGetPayload<{
  include: typeof REQUIREMENT_INCLUDE;
}>;

type RequirementQuery = {
  keyword?: string;
  priority?: string;
  devOwnerId?: string;
  status?: string;
};

@Injectable()
export class RequirementsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: RequirementQuery) {
    const where: Prisma.RequirementWhereInput = {};
    const keyword = query.keyword?.trim();

    if (keyword) {
      where.OR = [
        { code: { contains: keyword } },
        { title: { contains: keyword } },
        { description: { contains: keyword } }
      ];
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    if (query.devOwnerId) {
      where.devOwnerId = query.devOwnerId;
    }

    const all = await this.prisma.requirement.findMany({
      where,
      include: REQUIREMENT_INCLUDE,
      orderBy: { createdAt: "desc" }
    });

    const items = all.map((item) => this.sanitize(item));

    if (!query.status) return items;

    return items.filter((item) => item.status === query.status);
  }

  async detail(id: string) {
    const requirement = await this.prisma.requirement.findUnique({
      where: { id },
      include: REQUIREMENT_INCLUDE
    });

    if (!requirement) {
      throw new NotFoundException("需求不存在");
    }

    return this.sanitize(requirement);
  }

  async myRequirements(user: AuthUser) {
    const where: Prisma.RequirementWhereInput = {};

    if (user.role === "dev") {
      where.devOwnerId = user.id;
    } else if (user.role === "qa") {
      where.OR = [
        { qaOwnerId: user.id },
        { qaMembers: { some: { userId: user.id } } }
      ];
    } else if (user.role === "pm") {
      where.pmOwnerId = user.id;
    }

    const requirements = await this.prisma.requirement.findMany({
      where,
      include: REQUIREMENT_INCLUDE,
      orderBy: { createdAt: "desc" }
    });

    return requirements.map((item) => this.sanitize(item));
  }

  async ownerOptions() {
    const users = await this.prisma.user.findMany({
      where: { active: true, role: { in: ["dev", "qa", "pm"] } },
      select: PERSON_SELECT,
      orderBy: [{ role: "asc" }, { level: "asc" }, { name: "asc" }]
    });

    return {
      dev: users.filter((user) => user.role === "dev"),
      qa: users.filter((user) => user.role === "qa"),
      pm: users.filter((user) => user.role === "pm")
    };
  }

  async create(dto: CreateRequirementDto) {
    const owners = await this.validateOwners(dto);
    const code = await this.resolveCode(dto.code);

    const requirement = await this.prisma.requirement.create({
      data: {
        code,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        devOwnerId: owners.dev.id,
        qaOwnerId: owners.qa.id,
        pmOwnerId: owners.pm.id,
        priority: dto.priority,
        startAt: new Date(dto.startAt),
        dueAt: new Date(dto.dueAt)
      },
      include: REQUIREMENT_INCLUDE
    });

    return this.sanitize(requirement);
  }

  async update(id: string, dto: UpdateRequirementDto) {
    const exists = await this.prisma.requirement.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException("需求不存在");
    }

    const owners = await this.validateOwners(dto);
    const code = dto.code?.trim() || exists.code;

    if (code !== exists.code) {
      const duplicated = await this.prisma.requirement.findUnique({ where: { code } });
      if (duplicated) {
        throw new BadRequestException("需求编号已存在");
      }
    }

    const requirement = await this.prisma.requirement.update({
      where: { id },
      data: {
        code,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        devOwnerId: owners.dev.id,
        qaOwnerId: owners.qa.id,
        pmOwnerId: owners.pm.id,
        priority: dto.priority,
        startAt: new Date(dto.startAt),
        dueAt: new Date(dto.dueAt)
      },
      include: REQUIREMENT_INCLUDE
    });

    return this.sanitize(requirement);
  }

  async updateQaMembers(id: string, userIds: string[]) {
    const requirement = await this.prisma.requirement.findUnique({ where: { id } });
    if (!requirement) {
      throw new NotFoundException("需求不存在");
    }

    const uniqueIds = Array.from(new Set([...userIds, requirement.qaOwnerId]));

    const users = await this.prisma.user.findMany({
      where: { id: { in: uniqueIds } }
    });

    if (users.length !== uniqueIds.length) {
      throw new BadRequestException("存在不存在的测试人员");
    }

    const invalid = users.find((user) => user.role !== "qa" || !user.active);
    if (invalid) {
      throw new BadRequestException(`「${invalid.name}」不是启用的测试人员`);
    }

    await this.prisma.$transaction([
      this.prisma.requirementQaMember.deleteMany({ where: { requirementId: id } }),
      this.prisma.requirementQaMember.createMany({
        data: uniqueIds.map((userId) => ({ requirementId: id, userId }))
      })
    ]);

    return this.detail(id);
  }

  private async validateOwners(dto: CreateRequirementDto) {
    const users = await this.prisma.user.findMany({
      where: { id: { in: [dto.devOwnerId, dto.qaOwnerId, dto.pmOwnerId] } }
    });

    const dev = users.find((user) => user.id === dto.devOwnerId);
    const qa = users.find((user) => user.id === dto.qaOwnerId);
    const pm = users.find((user) => user.id === dto.pmOwnerId);

    if (!dev || dev.role !== "dev" || !dev.active) {
      throw new BadRequestException("开发负责人必须是启用的开发人员");
    }
    if (!qa || qa.role !== "qa" || !qa.active) {
      throw new BadRequestException("测试负责人必须是启用的测试人员");
    }
    if (!pm || pm.role !== "pm" || !pm.active) {
      throw new BadRequestException("产品负责人必须是启用的产品人员");
    }

    return { dev, qa, pm };
  }

  private async resolveCode(input?: string): Promise<string> {
    const code = input?.trim();
    if (code) {
      const exists = await this.prisma.requirement.findUnique({ where: { code } });
      if (exists) {
        throw new BadRequestException("需求编号已存在");
      }
      return code;
    }

    let seq = (await this.prisma.requirement.count()) + 1045;
    let candidate = `REQ-${seq}`;
    while (await this.prisma.requirement.findUnique({ where: { code: candidate } })) {
      seq += 1;
      candidate = `REQ-${seq}`;
    }
    return candidate;
  }

  private sanitize(requirement: RequirementWithPeople) {
    const summary = summarizeRequirement(requirement.tasks);

    return {
      id: requirement.id,
      code: requirement.code,
      title: requirement.title,
      description: requirement.description ?? "",
      devOwner: requirement.devOwner,
      qaOwner: requirement.qaOwner,
      pmOwner: requirement.pmOwner,
      qaMembers: requirement.qaMembers.map((member) => member.user),
      priority: requirement.priority,
      startAt: requirement.startAt,
      dueAt: requirement.dueAt,
      createdAt: requirement.createdAt,
      updatedAt: requirement.updatedAt,
      taskCount: requirement.tasks.length,
      status: summary.status,
      statusLabel: summary.statusLabel,
      tasks: requirement.tasks.map((task) => ({
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
      }))
    };
  }
}
