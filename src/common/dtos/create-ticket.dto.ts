import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsInt,
} from 'class-validator';
import { TicketPriority, TicketStatus } from '../enums/ticket.enum';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(TicketPriority)
  priority: TicketPriority;

  @IsInt()
  categoryId: number;

  @IsInt()
  clientId: number;

  @IsInt()
  technicianId: number;
}

export class UpdateTicketStatusDto {
  @IsEnum(TicketStatus)
  status: TicketStatus;
}

