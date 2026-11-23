import {
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from "class-validator";
import { APP_PLATFORMS, ARTIFACT_TYPES } from "../../common/constants";

export class CreateAppDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  name: string;

  @IsIn(APP_PLATFORMS)
  platform: string;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  code: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  repo: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  defaultBranch?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  buildScript?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  channels?: string | null;

  @IsIn(ARTIFACT_TYPES)
  artifactType: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  artifactPattern?: string | null;

  @IsOptional()
  @IsObject()
  branches?: Record<string, string>;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  machine?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  stack?: string | null;
}

export class UpdateAppDto extends CreateAppDto {}
