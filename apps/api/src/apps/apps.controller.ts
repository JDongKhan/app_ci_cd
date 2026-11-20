import { Body, Controller, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AdminGuard } from "../common/admin.guard";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { AppsService } from "./apps.service";
import { CreateAppDto, UpdateAppDto } from "./dto/app.dto";

@ApiTags("apps")
@ApiBearerAuth()
@Controller("apps")
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  list() {
    return this.appsService.list();
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() dto: CreateAppDto) {
    return this.appsService.create(dto);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param("id") id: string, @Body() dto: UpdateAppDto) {
    return this.appsService.update(id, dto);
  }
}
