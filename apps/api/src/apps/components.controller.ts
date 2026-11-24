import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/current-user.decorator";
import { AuthUser } from "../common/auth-user.interface";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { RequirePermissions } from "../common/permissions.decorator";
import { PermissionsGuard } from "../common/permissions.guard";
import { ComponentsService } from "./components.service";
import { AddComponentsDto, UpdateComponentVersionDto } from "./dto/component.dto";

@ApiTags("components")
@Controller("components")
export class PublicComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  @Get()
  byCode(@Query("appCode") appCode: string) {
    return this.componentsService.byCode(appCode);
  }

  @Post("version")
  updateVersion(@Body() dto: UpdateComponentVersionDto) {
    return this.componentsService.updateVersion(dto);
  }
}

@ApiTags("components")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("apps/:appId/components")
export class AppComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  @Get()
  @RequirePermissions("components")
  list(@Param("appId") appId: string) {
    return this.componentsService.list(appId);
  }

  @Post()
  @RequirePermissions("component_edit")
  add(
    @Param("appId") appId: string,
    @Body() dto: AddComponentsDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.componentsService.add(appId, dto, user);
  }

  @Delete(":componentAppId")
  @RequirePermissions("component_edit")
  remove(
    @Param("appId") appId: string,
    @Param("componentAppId") componentAppId: string
  ) {
    return this.componentsService.remove(appId, componentAppId);
  }
}
