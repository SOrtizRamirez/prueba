import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { User } from './users/users.entity';
import { Client } from './client/client.entity';
import { Technician } from './technician/technician.entity';
import { Category } from './category/category.entity';
import { Ticket } from './ticket/ticket.entity';

import { AuthModule } from './auth/auth.module';
import { TicketModule } from './ticket/ticket.module';
import { CategoryModule } from './category/category.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        entities: [User, Client, Technician, Category, Ticket],
        synchronize: false,
        logging: false,
      }),
    }),
    AuthModule,
    TicketModule,
    CategoryModule,
  ],
})
export class AppModule {}
