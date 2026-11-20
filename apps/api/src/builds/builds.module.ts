import { Module } from "@nestjs/common";
import { GitService } from "../common/git.service";
import { BuildsController } from "./builds.controller";
import { BuildsService } from "./builds.service";

@Module({
  controllers: [BuildsController],
  providers: [BuildsService, GitService],
  exports: [BuildsService]
})
export class BuildsModule {}
