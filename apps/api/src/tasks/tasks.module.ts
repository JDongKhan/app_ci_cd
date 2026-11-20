import { Module } from "@nestjs/common";
import { PipelinesModule } from "../pipelines/pipelines.module";
import {
  BoardController,
  MyTasksController,
  TasksController
} from "./tasks.controller";
import { TasksService } from "./tasks.service";

@Module({
  imports: [PipelinesModule],
  controllers: [TasksController, MyTasksController, BoardController],
  providers: [TasksService]
})
export class TasksModule {}
