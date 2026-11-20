import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AdminGuard } from "../common/admin.guard";
import { CurrentUser } from "../common/current-user.decorator";
import { AuthUser } from "../common/auth-user.interface";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { RequirePermissions } from "../common/permissions.decorator";
import { PermissionsGuard } from "../common/permissions.guard";
import { AdvanceTaskStatusDto, CreateTaskDto, UpdateTaskDto } from "./dto/task.dto";
import { TasksService } from "./tasks.service";

@ApiTags("tasks")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get(":id")
  detail(@Param("id") id: string) {
    return this.tasksService.detail(id);
  }

  @Get(":id/commits")
  commits(@Param("id") id: string, @Query("limit") limit?: string) {
    return this.tasksService.commits(id, Number(limit) || 20);
  }

  @Post()
  @RequirePermissions("task_create")
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Put(":id")
  @RequirePermissions("task_create")
  update(@Param("id") id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, dto);
  }

  @Post(":id/status")
  advanceStatus(
    @Param("id") id: string,
    @Body() dto: AdvanceTaskStatusDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.tasksService.advanceStatus(id, dto.status, user);
  }

  @Delete(":id")
  @UseGuards(AdminGuard)
  remove(@Param("id") id: string) {
    return this.tasksService.remove(id);
  }
}

@ApiTags("tasks")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("my-tasks")
export class MyTasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @RequirePermissions("home")
  list(@CurrentUser() user: AuthUser) {
    return this.tasksService.myTasks(user);
  }
}

@ApiTags("tasks")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("board")
export class BoardController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @RequirePermissions("board")
  list() {
    return this.tasksService.board();
  }
}
