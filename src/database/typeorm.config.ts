// src/database/typeorm.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/users.entity';
import { Client } from '../client/client.entity';
import { Technician } from '../technician/technician.entity';
import { Category } from '../category/category.entity';
import { Ticket } from '../ticket/ticket.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) ?? 5432,
  username: process.env.DB_USERNAME ?? 'user',
  password: process.env.DB_PASSWORD ?? 'password',
  database: process.env.DB_NAME ?? 'tech_helpdesk',
  entities: [User, Client, Technician, Category, Ticket],
  synchronize: false, 
};
