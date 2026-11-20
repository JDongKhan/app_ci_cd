import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/current-user.decorator";
import { AuthUser } from "../common/auth-user.interface";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { RequirePermissions } from "../common/permissions.decorator";
import { PermissionsGuard } from "../common/permissions.guard";
import { MergeStage } from "../common/pipeline-status";
import { CreatePipelineDto, MergePipelineDto } from "./dto/pipeline.dto";
import { PipelinesService } from "./pipelines.service";

@ApiTags("pipelines")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller()
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  @Post("tasks/:id/pipelines")
  @RequirePermissions("pipe_create")
  create(@Param("id") taskId: string, @Body() dto: CreatePipelineDto) {
    return this.pipelinesService.create(taskId, dto);
  }

  @Get("pipelines/:id")
  detail(@Param("id") id: string) {
    return this.pipelinesService.detail(id);
  }

  @Post("pipelines/:id/merge")
  merge(
    @Param("id") id: string,
    @Body() dto: MergePipelineDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.pipelinesService.merge(id, dto.stage as MergeStage, user);
  }

  @Post("pipelines/:id/resolve")
  resolve(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    return this.pipelinesService.resolve(id, user);
  }
}
