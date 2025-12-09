import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength, } from 'class-validator';
import { Role } from '../../common/enums/role.enum';
import { PartialType } from '@nestjs/swagger';
export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role = Role.CLIENT;
}


export class UpdateUserDto extends PartialType(CreateUserDto) {}