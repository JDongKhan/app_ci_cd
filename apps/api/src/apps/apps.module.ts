import { Module } from "@nestjs/common";
import { GitService } from "../common/git.service";
import { AppsController } from "./apps.controller";
import { AppsService } from "./apps.service";
import {
  AppComponentsController,
  PublicComponentsController
} from "./components.controller";
import { ComponentsService } from "./components.service";

@Module({
  controllers: [AppsController, PublicComponentsController, AppComponentsController],
  providers: [AppsService, ComponentsService, GitService]
})
export class AppsModule {}
