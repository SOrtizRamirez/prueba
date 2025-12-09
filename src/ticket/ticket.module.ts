import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { Category } from '../category/category.entity';
import { Client } from '../client/client.entity';
import { Technician } from '../technician/technician.entity';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ticket, Category, Client, Technician])],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {}
