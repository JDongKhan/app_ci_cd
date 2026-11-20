import { Module } from "@nestjs/common";
import { BuildsModule } from "../builds/builds.module";
import { PipelinesController } from "./pipelines.controller";
import { PipelinesService } from "./pipelines.service";

@Module({
  imports: [BuildsModule],
  controllers: [PipelinesController],
  providers: [PipelinesService],
  exports: [PipelinesService]
})
export class PipelinesModule {}
