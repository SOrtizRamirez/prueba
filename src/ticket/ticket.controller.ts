import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Get,
  UseGuards,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto, UpdateTicketStatusDto } from '../common/dtos/create-ticket.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @Roles(Role.CLIENT, Role.ADMIN)
  create(
    @Body() dto: CreateTicketDto,
    @CurrentUser() user: any,
  ) {
    return this.ticketService.create(dto, user);
  }

  @Patch(':id/status')
  @Roles(Role.TECHNICIAN, Role.ADMIN)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTicketStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.ticketService.updateStatus(id, dto, user);
  }

  @Get('client/:clientId')
  @Roles(Role.CLIENT, Role.ADMIN)
  findByClient(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.ticketService.findByClient(clientId);
  }

  @Get('technician/:technicianId')
  @Roles(Role.TECHNICIAN, Role.ADMIN)
  findByTechnician(
    @Param('technicianId', ParseIntPipe) technicianId: number,
  ) {
    return this.ticketService.findByTechnician(technicianId);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.ticketService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TECHNICIAN, Role.CLIENT)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.findOne(id);
  }
}
