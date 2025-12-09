import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Technician } from './technician.entity';
import { User } from '../users/users.entity';
import { CreateTechnicianDto, UpdateTechnicianDto } from '../common/dtos/create-technician.dto';

@Injectable()
export class TechnicianService {
  constructor(
    @InjectRepository(Technician)
    private readonly technicianRepo: Repository<Technician>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: CreateTechnicianDto) {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('Usuario asociado no encontrado');

    const exists = await this.technicianRepo.findOne({
      where: { user: { id: user.id } },
    });
    if (exists) {
      throw new BadRequestException('Ese usuario ya está asociado a un technician');
    }

    const technician = this.technicianRepo.create({
      name: dto.name,
      specialty: dto.specialty,
      availability: dto.availability ?? true,
      user,
    });

    return this.technicianRepo.save(technician);
  }

  findAll() {
    return this.technicianRepo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const technician = await this.technicianRepo.findOne({ where: { id } });
    if (!technician) throw new NotFoundException('Técnico no encontrado');
    return technician;
  }

  async update(id: number, dto: UpdateTechnicianDto) {
    const technician = await this.findOne(id);

    if (dto.userId && dto.userId !== technician.user.id) {
      const user = await this.userRepo.findOne({ where: { id: dto.userId } });
      if (!user) throw new NotFoundException('Usuario asociado no encontrado');
      technician.user = user;
    }

    Object.assign(technician, {
      name: dto.name ?? technician.name,
      specialty: dto.specialty ?? technician.specialty,
      availability:
        dto.availability !== undefined
          ? dto.availability
          : technician.availability,
    });

    return this.technicianRepo.save(technician);
  }

  async remove(id: number) {
    const technician = await this.findOne(id);
    await this.technicianRepo.remove(technician);
    return { message: 'Técnico eliminado correctamente' };
  }
}
