import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { CreateStaffDto, UpdateStaffDto } from "./dto/staff.dto";

type StaffQuery = {
  keyword?: string;
  role?: string;
  active?: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: StaffQuery) {
    const keyword = query.keyword?.trim();
    const active =
      query.active === "true" ? true : query.active === "false" ? false : undefined;

    const where: Record<string, unknown> = {};

    if (keyword) {
      where.OR = [
        { account: { contains: keyword.toLowerCase() } },
        { name: { contains: keyword } },
        { team: { contains: keyword } }
      ];
    }

    if (query.role) {
      where.role = query.role;
    }

    if (active !== undefined) {
      where.active = active;
    }

    const users = await this.prisma.user.findMany({
      where,
      orderBy: [{ role: "asc" }, { level: "asc" }, { createdAt: "asc" }]
    });

    return users.map((user) => this.sanitize(user));
  }

  async create(dto: CreateStaffDto) {
    const account = dto.account.trim().toLowerCase();
    const level = this.normalizeLevel(dto.role, dto.level);

    const exists = await this.prisma.user.findUnique({ where: { account } });
    if (exists) {
      throw new ConflictException("账号已存在");
    }

    const user = await this.prisma.user.create({
      data: {
        account,
        passwordHash: await bcrypt.hash(dto.password, 10),
        name: dto.name.trim(),
        role: dto.role,
        level,
        team: dto.team?.trim() || null
      }
    });

    return this.sanitize(user);
  }

  async update(id: string, dto: UpdateStaffDto, currentUserId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException("人员不存在");
    }

    const level = this.normalizeLevel(dto.role, dto.level);

    if (id === currentUserId) {
      if (!dto.active) {
        throw new BadRequestException("不能停用当前登录账号");
      }
      if (dto.role !== "admin") {
        throw new BadRequestException("不能修改当前登录账号的管理员角色");
      }
    }

    const willRemoveActiveAdmin =
      user.role === "admin" &&
      user.active &&
      (dto.role !== "admin" || !dto.active);

    if (willRemoveActiveAdmin && (await this.activeAdminCount()) <= 1) {
      throw new BadRequestException("系统至少需要保留一个启用的管理员");
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name.trim(),
        role: dto.role,
        level,
        team: dto.team?.trim() || null,
        active: dto.active
      }
    });

    return this.sanitize(updated);
  }

  async updateStatus(id: string, active: boolean, currentUserId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException("人员不存在");
    }

    if (!active && id === currentUserId) {
      throw new BadRequestException("不能停用当前登录账号");
    }

    if (!active && user.role === "admin" && user.active && (await this.activeAdminCount()) <= 1) {
      throw new BadRequestException("系统至少需要保留一个启用的管理员");
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { active }
    });

    return this.sanitize(updated);
  }

  async resetPassword(id: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException("人员不存在");
    }

    await this.prisma.user.update({
      where: { id },
      data: { passwordHash: await bcrypt.hash(password, 10) }
    });

    return { ok: true };
  }

  private normalizeLevel(role: string, level?: string | null): string | null {
    if (role === "admin") {
      return null;
    }

    if (!level) {
      throw new BadRequestException("非管理员必须选择级别");
    }

    if (!["l1", "l2", "l3"].includes(level)) {
      throw new BadRequestException("级别不合法");
    }

    return level;
  }

  private activeAdminCount(): Promise<number> {
    return this.prisma.user.count({
      where: { role: "admin", active: true }
    });
  }

  private sanitize(user: {
    id: string;
    account: string;
    name: string;
    role: string;
    level: string | null;
    team: string | null;
    active: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: user.id,
      account: user.account,
      name: user.name,
      role: user.role,
      level: user.level,
      team: user.team,
      active: user.active,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
