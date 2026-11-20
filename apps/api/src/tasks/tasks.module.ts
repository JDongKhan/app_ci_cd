import { Module } from "@nestjs/common";
import { PipelinesModule } from "../pipelines/pipelines.module";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";

@Module({
  imports: [PipelinesModule],
  controllers: [TasksController],
  providers: [TasksService]
})
export class TasksModule {}
