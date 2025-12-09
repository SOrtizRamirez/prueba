import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './ticket.entity';
import { Category } from '../category/category.entity';
import { Client } from '../client/client.entity';
import { Technician } from '../technician/technician.entity';
import { CreateTicketDto, UpdateTicketStatusDto } from '../common/dtos/create-ticket.dto';
import { TicketStatus } from '../common/enums/ticket.enum';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepo: Repository<Ticket>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
    @InjectRepository(Technician)
    private readonly technicianRepo: Repository<Technician>,
  ) {}

  async create(createDto: CreateTicketDto, currentUser: any) {
    if (currentUser.role !== Role.CLIENT && currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Solo clientes o admin pueden crear tickets');
    }

    const category = await this.categoryRepo.findOne({
      where: { id: createDto.categoryId },
    });
    if (!category) throw new NotFoundException('Categoría no encontrada');

    const client = await this.clientRepo.findOne({
      where: { id: createDto.clientId },
    });
    if (!client) throw new NotFoundException('Cliente no encontrado');

    const technician = await this.technicianRepo.findOne({
      where: { id: createDto.technicianId },
    });
    if (!technician) throw new NotFoundException('Técnico no encontrado');

    const ticket = this.ticketRepo.create({
      title: createDto.title,
      description: createDto.description,
      priority: createDto.priority,
      category,
      client,
      technician,
      status: TicketStatus.OPEN,
    });

    return this.ticketRepo.save(ticket);
  }

  private isValidTransition(oldStatus: TicketStatus, newStatus: TicketStatus) {
    if (oldStatus === TicketStatus.OPEN && newStatus === TicketStatus.IN_PROGRESS)
      return true;
    if (oldStatus === TicketStatus.IN_PROGRESS && newStatus === TicketStatus.RESOLVED)
      return true;
    if (oldStatus === TicketStatus.RESOLVED && newStatus === TicketStatus.CLOSED)
      return true;
    return false;
  }

  async updateStatus(
    id: number,
    dto: UpdateTicketStatusDto,
    currentUser: any,
  ) {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');

    if (currentUser.role !== Role.TECHNICIAN && currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Solo técnicos o admin pueden cambiar el estado');
    }

    if (!this.isValidTransition(ticket.status, dto.status)) {
      throw new BadRequestException(
        `Transición inválida de ${ticket.status} a ${dto.status}`,
      );
    }

    if (dto.status === TicketStatus.IN_PROGRESS && ticket.technician) {
      const countInProgress = await this.ticketRepo.count({
        where: {
          technician: { id: ticket.technician.id },
          status: TicketStatus.IN_PROGRESS,
        },
      });

      if (countInProgress >= 5) {
        throw new BadRequestException(
          'El técnico ya tiene 5 tickets en progreso',
        );
      }
    }

    ticket.status = dto.status;
    return this.ticketRepo.save(ticket);
  }

  async findByClient(clientId: number) {
    return this.ticketRepo.find({
      where: { client: { id: clientId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findByTechnician(technicianId: number) {
    return this.ticketRepo.find({
      where: { technician: { id: technicianId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll() {
    return this.ticketRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    const ticket = await this.ticketRepo.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    return ticket;
  }
}
