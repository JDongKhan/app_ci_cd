import { IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class TriggerBuildDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  versionName?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  buildNumber?: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  channel?: string;
}
