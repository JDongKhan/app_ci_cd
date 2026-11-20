import { Module } from "@nestjs/common";
import {
  MyRequirementsController,
  RequirementsController
} from "./requirements.controller";
import { RequirementsService } from "./requirements.service";

@Module({
  controllers: [RequirementsController, MyRequirementsController],
  providers: [RequirementsService]
})
export class RequirementsModule {}
