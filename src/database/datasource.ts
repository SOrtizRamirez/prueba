// src/database/datasource.ts
import 'reflect-metadata';
import 'dotenv/config';
import { DataSource } from 'typeorm';

import { User } from '../users/users.entity';
import { Client } from '../client/client.entity';
import { Technician } from '../technician/technician.entity';
import { Category } from '../category/category.entity';
import { Ticket } from '../ticket/ticket.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER ?? 'tu_usuario',
  password: process.env.DB_PASS ?? 'tu_password',
  database: process.env.DB_NAME ?? 'tech_helpdesk',
  entities: [User, Client, Technician, Category, Ticket],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false, 
  logging: false,
});

export default dataSource;
