import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../common/current-user.decorator";
import { AdminGuard } from "../common/admin.guard";
import { AuthUser } from "../common/auth-user.interface";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { CreateStaffDto, ResetPasswordDto, UpdateStaffDto, UpdateStaffStatusDto } from "./dto/staff.dto";
import { UsersService } from "./users.service";

@ApiTags("staff")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller("staff")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(
    @Query("keyword") keyword?: string,
    @Query("role") role?: string,
    @Query("active") active?: string
  ) {
    return this.usersService.list({ keyword, role, active });
  }

  @Post()
  create(@Body() dto: CreateStaffDto) {
    return this.usersService.create(dto);
  }

  @Put(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateStaffDto,
    @CurrentUser() currentUser: AuthUser
  ) {
    return this.usersService.update(id, dto, currentUser.id);
  }

  @Put(":id/status")
  updateStatus(
    @Param("id") id: string,
    @Body() dto: UpdateStaffStatusDto,
    @CurrentUser() currentUser: AuthUser
  ) {
    return this.usersService.updateStatus(id, dto.active, currentUser.id);
  }

  @Put(":id/password")
  resetPassword(@Param("id") id: string, @Body() dto: ResetPasswordDto) {
    return this.usersService.resetPassword(id, dto.password);
  }
}
