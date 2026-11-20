import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { AuthUser } from "./auth-user.interface";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser | undefined;

    if (!user || user.role !== "admin") {
      throw new ForbiddenException("仅管理员可以执行该操作");
    }

    return true;
  }
}
