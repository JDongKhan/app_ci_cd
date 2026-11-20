import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/current-user.decorator";
import { AuthUser } from "../common/auth-user.interface";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { RequirePermissions } from "../common/permissions.decorator";
import { PermissionsGuard } from "../common/permissions.guard";
import { BuildsService } from "./builds.service";

@ApiTags("builds")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class BuildsController {
  constructor(private readonly buildsService: BuildsService) {}

  @Post("pipelines/:id/build")
  @RequirePermissions("build_run")
  trigger(@Param("id") pipelineId: string, @CurrentUser() user: AuthUser) {
    return this.buildsService.trigger(pipelineId, user);
  }

  @Get("tasks/:id/builds")
  listByTask(@Param("id") taskId: string) {
    return this.buildsService.listByTask(taskId);
  }

  @Get("builds/:id")
  detail(@Param("id") id: string) {
    return this.buildsService.detail(id);
  }

  @Get("builds/:id/log")
  log(@Param("id") id: string, @Query("offset") offset?: string) {
    return this.buildsService.log(id, Number(offset) || 0);
  }
}
