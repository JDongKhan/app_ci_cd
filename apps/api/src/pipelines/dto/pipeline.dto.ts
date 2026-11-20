import { IsIn, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { MERGE_STAGES } from "../../common/pipeline-status";

export class CreatePipelineDto {
  @IsString()
  appId: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  name?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  branch: string;
}

export class MergePipelineDto {
  @IsIn(MERGE_STAGES)
  stage: string;
}
