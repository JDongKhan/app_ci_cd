import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { RequirePermissions } from "../common/permissions.decorator";
import { PermissionsGuard } from "../common/permissions.guard";
import { LogsService } from "./logs.service";

@ApiTags("logs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("logs")
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @RequirePermissions("logs")
  list(
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
    @Query("action") action?: string,
    @Query("module") module?: string,
    @Query("keyword") keyword?: string
  ) {
    return this.logsService.list({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 20,
      action,
      module,
      keyword
    });
  }

  @Get("modules")
  @RequirePermissions("logs")
  modules() {
    return this.logsService.modules();
  }
}
