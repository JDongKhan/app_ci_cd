import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../prisma/prisma.service";
import { AuthUser } from "./auth-user.interface";
import { PERMISSIONS_KEY } from "./permissions.decorator";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required =
      this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass()
      ]) ?? [];

    if (required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser | undefined;

    if (!user) {
      throw new ForbiddenException("没有该操作权限");
    }

    if (user.role === "admin") return true;

    if (!user.level) {
      throw new ForbiddenException("没有该操作权限");
    }

    const rows = await this.prisma.rolePermission.findMany({
      where: {
        role: user.role,
        level: user.level,
        permissionKey: { in: required }
      },
      select: { permissionKey: true }
    });

    if (new Set(rows.map((row) => row.permissionKey)).size < required.length) {
      throw new ForbiddenException("没有该操作权限");
    }

    return true;
  }
}
