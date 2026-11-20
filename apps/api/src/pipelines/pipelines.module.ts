import { Module } from "@nestjs/common";
import { BuildsModule } from "../builds/builds.module";
import { GitService } from "../common/git.service";
import { PipelinesController } from "./pipelines.controller";
import { PipelinesService } from "./pipelines.service";

@Module({
  imports: [BuildsModule],
  controllers: [PipelinesController],
  providers: [PipelinesService, GitService],
  exports: [PipelinesService]
})
export class PipelinesModule {}
