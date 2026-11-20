import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from "class-validator";
import { PRIORITIES, TASK_STATUSES } from "../../common/constants";

export class CreateTaskDto {
  @IsString()
  reqId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsIn(PRIORITIES)
  priority?: string;

  @IsDateString()
  startAt: string;

  @IsDateString()
  dueAt: string;
}

export class UpdateTaskDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsIn(PRIORITIES)
  priority?: string;

  @IsDateString()
  startAt: string;

  @IsDateString()
  dueAt: string;
}

export class AdvanceTaskStatusDto {
  @IsIn(TASK_STATUSES)
  status: string;
}
