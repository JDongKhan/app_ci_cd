import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/current-user.decorator";
import { AuthUser } from "../common/auth-user.interface";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { RequirePermissions } from "../common/permissions.decorator";
import { PermissionsGuard } from "../common/permissions.guard";
import {
  CreateRequirementDto,
  UpdateQaMembersDto,
  UpdateRequirementDto
} from "./dto/requirement.dto";
import { RequirementsService } from "./requirements.service";

@ApiTags("requirements")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("requirements")
export class RequirementsController {
  constructor(private readonly requirementsService: RequirementsService) {}

  @Get()
  @RequirePermissions("reqs")
  list(
    @Query("keyword") keyword?: string,
    @Query("priority") priority?: string,
    @Query("devOwnerId") devOwnerId?: string,
    @Query("status") status?: string
  ) {
    return this.requirementsService.list({ keyword, priority, devOwnerId, status });
  }

  @Get("owner-options")
  @RequirePermissions("reqs")
  ownerOptions() {
    return this.requirementsService.ownerOptions();
  }

  @Get(":id")
  @RequirePermissions("reqs")
  detail(@Param("id") id: string) {
    return this.requirementsService.detail(id);
  }

  @Post()
  @RequirePermissions("req_create")
  create(@Body() dto: CreateRequirementDto) {
    return this.requirementsService.create(dto);
  }

  @Put(":id")
  @RequirePermissions("req_create")
  update(@Param("id") id: string, @Body() dto: UpdateRequirementDto) {
    return this.requirementsService.update(id, dto);
  }

  @Put(":id/qa-members")
  @RequirePermissions("req_member")
  updateQaMembers(@Param("id") id: string, @Body() dto: UpdateQaMembersDto) {
    return this.requirementsService.updateQaMembers(id, dto.userIds);
  }
}

@ApiTags("requirements")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("my-requirements")
export class MyRequirementsController {
  constructor(private readonly requirementsService: RequirementsService) {}

  @Get()
  @RequirePermissions("home")
  list(@CurrentUser() user: AuthUser) {
    return this.requirementsService.myRequirements(user);
  }
}
