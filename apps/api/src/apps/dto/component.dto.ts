import {
  ArrayNotEmpty,
  IsArray,
  IsString,
  MaxLength,
  MinLength
} from "class-validator";

export class AddComponentsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  componentAppIds: string[];
}

export class UpdateComponentVersionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  appCode: string;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  componentCode: string;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  version: string;
}
