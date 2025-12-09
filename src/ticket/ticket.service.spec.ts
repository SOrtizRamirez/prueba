// src/ticket/ticket.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ObjectLiteral } from 'typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { TicketService } from './ticket.service';
import { Ticket } from './ticket.entity';
import { Category } from '../category/category.entity';
import { Client } from '../client/client.entity';
import { Technician } from '../technician/technician.entity';

import {
  CreateTicketDto,
  UpdateTicketStatusDto,
} from '../common/dtos/create-ticket.dto';
import { TicketStatus } from '../common/enums/ticket.enum';
import { Role } from '../common/enums/role.enum';

// Tipo auxiliar para mockear repos de TypeORM
type MockRepo<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepo = <T extends ObjectLiteral = any>(): MockRepo<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  count: jest.fn(),
});

describe('TicketService', () => {
  let service: TicketService;
  let ticketRepo: MockRepo<Ticket>;
  let categoryRepo: MockRepo<Category>;
  let clientRepo: MockRepo<Client>;
  let technicianRepo: MockRepo<Technician>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketService,
        { provide: getRepositoryToken(Ticket), useValue: createMockRepo() },
        { provide: getRepositoryToken(Category), useValue: createMockRepo() },
        { provide: getRepositoryToken(Client), useValue: createMockRepo() },
        { provide: getRepositoryToken(Technician), useValue: createMockRepo() },
      ],
    }).compile();

    service = module.get<TicketService>(TicketService);
    ticketRepo = module.get(getRepositoryToken(Ticket));
    categoryRepo = module.get(getRepositoryToken(Category));
    clientRepo = module.get(getRepositoryToken(Client));
    technicianRepo = module.get(getRepositoryToken(Technician));
  });

  // ---------------------------------------------------------------------------
  // 1) TEST: Creación de tickets
  // ---------------------------------------------------------------------------
  describe('create', () => {
    it('should create a ticket when data and role are valid', async () => {
      const dto: CreateTicketDto = {
        title: 'Printer not working',
        description: 'The main office printer is not responding.',
        // priority puede ser enum o string, casteamos a any para no pelear con el tipo
        priority: 'HIGH' as any,
        categoryId: 1,
        clientId: 1,
        technicianId: 1,
      };

      const currentUser = { role: Role.CLIENT };

      const category = { id: 1 } as Category;
      const client = { id: 1 } as Client;
      const technician = { id: 1 } as Technician;

      categoryRepo.findOne!.mockResolvedValue(category);
      clientRepo.findOne!.mockResolvedValue(client);
      technicianRepo.findOne!.mockResolvedValue(technician);
      ticketRepo.create!.mockImplementation((data) => data);
      ticketRepo.save!.mockImplementation((data) =>
        Promise.resolve({ id: 10, ...data }),
      );

      const result = await service.create(dto, currentUser);

      expect(categoryRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(clientRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(technicianRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(ticketRepo.create).toHaveBeenCalled();
      expect(ticketRepo.save).toHaveBeenCalled();
      expect(result.id).toBe(10);
      expect(result.title).toBe('Printer not working');
      expect(result.status).toBe(TicketStatus.OPEN);
    });

    it('should throw ForbiddenException if user role is not CLIENT or ADMIN', async () => {
      const dto: CreateTicketDto = {
        title: 'Test',
        description: 'Test',
        priority: 'LOW' as any,
        categoryId: 1,
        clientId: 1,
        technicianId: 1,
      };

      const currentUser = { role: Role.TECHNICIAN };

      await expect(service.create(dto, currentUser)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 2) TEST: Cambio de estado
  // ---------------------------------------------------------------------------
  describe('updateStatus', () => {
    it('should update ticket status from OPEN to IN_PROGRESS when technician is allowed', async () => {
      const technician = { id: 5 } as Technician;
      const ticket = {
        id: 1,
        status: TicketStatus.OPEN,
        technician,
      } as Ticket;

      ticketRepo.findOne!.mockResolvedValue(ticket);
      ticketRepo.count!.mockResolvedValue(0);
      ticketRepo.save!.mockImplementation((data) => Promise.resolve(data));

      const dto: UpdateTicketStatusDto = {
        status: TicketStatus.IN_PROGRESS,
      };

      const currentUser = { role: Role.TECHNICIAN };

      const result = await service.updateStatus(1, dto, currentUser);

      expect(ticketRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(ticketRepo.count).toHaveBeenCalledWith({
        where: {
          technician: { id: 5 },
          status: TicketStatus.IN_PROGRESS,
        },
      });
      expect(result.status).toBe(TicketStatus.IN_PROGRESS);
    });

    it('should throw BadRequestException on invalid status transition (OPEN -> CLOSED)', async () => {
      const technician = { id: 5 } as Technician;
      const ticket = {
        id: 1,
        status: TicketStatus.OPEN,
        technician,
      } as Ticket;

      ticketRepo.findOne!.mockResolvedValue(ticket);

      const dto: UpdateTicketStatusDto = {
        status: TicketStatus.CLOSED,
      };
      const currentUser = { role: Role.TECHNICIAN };

      await expect(
        service.updateStatus(1, dto, currentUser),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should throw NotFoundException if ticket does not exist', async () => {
      ticketRepo.findOne!.mockResolvedValue(null);

      const dto: UpdateTicketStatusDto = {
        status: TicketStatus.IN_PROGRESS,
      };
      const currentUser = { role: Role.TECHNICIAN };

      await expect(
        service.updateStatus(999, dto, currentUser),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
