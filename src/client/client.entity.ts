// src/client/client.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../users/users.entity';
import { Ticket } from '../ticket/ticket.entity';

@Entity({ name: 'clients' })
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 150, nullable: true })
  company?: string;

  // 👇 AQUÍ ESTABA EL PROBLEMA
  @Column({ name: 'contact_email', length: 150 })
  contactEmail: string;

  @OneToOne(() => User, (user) => user.client, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Ticket, (ticket) => ticket.client)
  tickets: Ticket[];
}
