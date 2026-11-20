import { Type } from "class-transformer";
import {
  IsArray,
  IsIn,
  IsString,
  MaxLength,
  ValidateNested
} from "class-validator";
import { EDITABLE_ROLES, LEVELS } from "../../common/constants";

export class PermissionItemDto {
  @IsIn(EDITABLE_ROLES)
  role: string;

  @IsIn(LEVELS)
  level: string;

  @IsArray()
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  permissions: string[];
}

export class UpdatePermissionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionItemDto)
  items: PermissionItemDto[];
}
