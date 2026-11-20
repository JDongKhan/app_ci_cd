import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../prisma/prisma.service";
import { ACTION_ROLES, isActionPermission } from "./action-permissions";
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

    for (const key of required) {
      if (isActionPermission(key)) {
        const roles = ACTION_ROLES[key] as readonly string[];
        if (!roles.includes(user.role)) {
          throw new ForbiddenException("没有该操作权限");
        }
        continue;
      }

      if (!user.level) {
        throw new ForbiddenException("没有该操作权限");
      }

      const row = await this.prisma.rolePermission.findFirst({
        where: {
          role: user.role,
          level: user.level,
          permissionKey: key
        }
      });

      if (!row) {
        throw new ForbiddenException("没有该操作权限");
      }
    }

    return true;
  }
}
