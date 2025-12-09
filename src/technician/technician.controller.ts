import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { CreateTechnicianDto, UpdateTechnicianDto } from '../common/dtos/create-technician.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('technicians')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('technicians')
export class TechnicianController {
  constructor(private readonly technicianService: TechnicianService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateTechnicianDto) {
    return this.technicianService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.technicianService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TECHNICIAN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.technicianService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTechnicianDto,
  ) {
    return this.technicianService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.technicianService.remove(id);
  }
}
