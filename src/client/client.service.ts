import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { User } from '../users/users.entity';
import { CreateClientDto, UpdateClientDto } from '../common/dtos/create-client.dto';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateClientDto) {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('Usuario asociado no encontrado');

    const exists = await this.clientRepo.findOne({ where: { user: { id: user.id } } });
    if (exists) {
      throw new BadRequestException('Ese usuario ya está asociado a un client');
    }

    const client = this.clientRepo.create({
      name: dto.name,
      company: dto.company,
      contactEmail: dto.contactEmail,
      user,
    });

    return this.clientRepo.save(client);
  }

  findAll() {
    return this.clientRepo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const client = await this.clientRepo.findOne({ where: { id } });
    if (!client) throw new NotFoundException('Cliente no encontrado');
    return client;
  }

  async update(id: number, dto: UpdateClientDto) {
    const client = await this.findOne(id);

    if (dto.userId && dto.userId !== client.user.id) {
      const user = await this.userRepo.findOne({ where: { id: dto.userId } });
      if (!user) throw new NotFoundException('Usuario asociado no encontrado');
      client.user = user;
    }

    Object.assign(client, {
      name: dto.name ?? client.name,
      company: dto.company ?? client.company,
      contactEmail: dto.contactEmail ?? client.contactEmail,
    });

    return this.clientRepo.save(client);
  }

  async remove(id: number) {
    const client = await this.findOne(id);
    await this.clientRepo.remove(client);
    return { message: 'Cliente eliminado correctamente' };
  }
}
