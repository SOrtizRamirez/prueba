import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from '../common/dtos/create-category.dto';


@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const exists = await this.categoryRepo.findOne({
      where: { name: dto.name },
    });
    if (exists) {
      throw new BadRequestException('Ya existe una categoría con ese nombre');
    }

    const category = this.categoryRepo.create(dto);
    return this.categoryRepo.save(category);
  }

  findAll() {
    return this.categoryRepo.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);

    if (dto.name && dto.name !== category.name) {
      const exists = await this.categoryRepo.findOne({
        where: { name: dto.name },
      });
      if (exists) {
        throw new BadRequestException(
          'Ya existe otra categoría con ese nombre',
        );
      }
    }

    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    await this.categoryRepo.remove(category);
    return { message: 'Categoría eliminada correctamente' };
  }
}
