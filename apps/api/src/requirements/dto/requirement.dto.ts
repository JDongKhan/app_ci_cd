import {
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from "class-validator";
import { PRIORITIES } from "../../common/constants";

export const REQUIREMENT_PRIORITIES = PRIORITIES;

export class CreateRequirementDto {
  @IsOptional()
  @IsString()
  @MaxLength(32)
  code?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsString()
  devOwnerId: string;

  @IsString()
  qaOwnerId: string;

  @IsString()
  pmOwnerId: string;

  @IsIn(REQUIREMENT_PRIORITIES)
  priority: string;

  @IsDateString()
  startAt: string;

  @IsDateString()
  dueAt: string;
}

export class UpdateRequirementDto extends CreateRequirementDto {}

export class UpdateQaMembersDto {
  @IsArray()
  @IsString({ each: true })
  userIds: string[];
}
