import { IsNotEmpty, IsString } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}