import { Body, Controller, Get, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AdminGuard } from "../common/admin.guard";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { UpdatePermissionsDto } from "./dto/permissions.dto";
import { RolesService } from "./roles.service";

@ApiTags("roles")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("roles")
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get("perms")
  getPermissions() {
    return this.rolesService.getPermissions();
  }

  @Put("perms")
  updatePermissions(@Body() dto: UpdatePermissionsDto) {
    return this.rolesService.updatePermissions(dto.items);
  }

  @Post("perms/reset")
  resetPermissions() {
    return this.rolesService.resetPermissions();
  }
}
