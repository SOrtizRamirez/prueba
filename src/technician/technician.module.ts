import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Technician } from './technician.entity';
import { User } from '../users/users.entity';
import { TechnicianService } from './technician.service';
import { TechnicianController } from './technician.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Technician, User])],
  controllers: [TechnicianController],
  providers: [TechnicianService],
  exports: [TechnicianService],
})
export class TechnicianModule {}
