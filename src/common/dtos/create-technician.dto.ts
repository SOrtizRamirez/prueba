import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
export class CreateTechnicianDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  specialty?: string;

  @IsBoolean()
  @IsOptional()
  availability?: boolean = true;

  @IsNumber()
  userId: number;
}

export class UpdateTechnicianDto extends PartialType(CreateTechnicianDto) {}