import { Module } from "@nestjs/common";
import { BuildsModule } from "../builds/builds.module";
import { ArtifactsController } from "./artifacts.controller";

@Module({
  imports: [BuildsModule],
  controllers: [ArtifactsController]
})
export class ArtifactsModule {}
