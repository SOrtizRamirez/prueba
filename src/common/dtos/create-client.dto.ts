import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsEmail()
  contactEmail: string;

  @IsNotEmpty()
  userId: number;
}

export class UpdateClientDto extends PartialType(CreateClientDto) {}