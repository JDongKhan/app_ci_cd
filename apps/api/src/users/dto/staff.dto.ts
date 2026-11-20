import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength
} from "class-validator";
import { LEVELS, ROLES } from "../../common/constants";

export class CreateStaffDto {
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  @Matches(/^[a-zA-Z0-9._-]+$/, { message: "账号只能包含字母、数字、点、下划线和短横线" })
  account: string;

  @IsString()
  @MinLength(6)
  @MaxLength(64)
  password: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  name: string;

  @IsIn(ROLES)
  role: string;

  @IsOptional()
  @IsIn(LEVELS)
  level?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  team?: string | null;
}

export class UpdateStaffDto {
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  name: string;

  @IsIn(ROLES)
  role: string;

  @IsOptional()
  @IsIn(LEVELS)
  level?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  team?: string | null;

  @IsBoolean()
  active: boolean;
}

export class UpdateStaffStatusDto {
  @IsBoolean()
  active: boolean;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  password: string;
}
