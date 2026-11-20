import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";

type UserRecord = {
  id: string;
  account: string;
  passwordHash: string;
  name: string;
  role: string;
  level: string | null;
  team: string | null;
  active: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  async login(dto: LoginDto) {
    const account = dto.account.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { account } });

    if (!user || !user.active) {
      throw new UnauthorizedException("账号或密码错误");
    }

    const passwordMatched = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatched) {
      throw new UnauthorizedException("账号或密码错误");
    }

    const loggedIn = await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    const token = await this.jwt.signAsync({
      sub: loggedIn.id,
      role: loggedIn.role,
      level: loggedIn.level
    });

    return {
      token,
      user: this.sanitizeUser(loggedIn),
      ...(await this.permissionsFor(loggedIn.role, loggedIn.level))
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.active) {
      throw new UnauthorizedException("账号已停用或不存在");
    }

    return {
      user: this.sanitizeUser(user),
      ...(await this.permissionsFor(user.role, user.level))
    };
  }

  async listLoginAccounts() {
    if (process.env.DEMO_LOGIN === "false") {
      return [];
    }

    return this.prisma.user.findMany({
      where: { active: true },
      select: {
        account: true,
        name: true,
        role: true,
        level: true,
        team: true
      },
      orderBy: [{ role: "asc" }, { level: "asc" }, { createdAt: "asc" }]
    });
  }

  async findActiveUser(userId: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return user && user.active ? user : null;
  }

  async permissionsFor(role: string, level: string | null) {
    if (role === "admin") {
      return { isAdmin: true, permissions: [] as string[] };
    }

    if (!level) {
      return { isAdmin: false, permissions: [] as string[] };
    }

    const rows = await this.prisma.rolePermission.findMany({
      where: { role, level },
      select: { permissionKey: true },
      orderBy: { permissionKey: "asc" }
    });

    return { isAdmin: false, permissions: rows.map((row) => row.permissionKey) };
  }

  sanitizeUser(user: UserRecord) {
    return {
      id: user.id,
      account: user.account,
      name: user.name,
      role: user.role,
      level: user.level,
      team: user.team,
      active: user.active,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt
    };
  }
}
