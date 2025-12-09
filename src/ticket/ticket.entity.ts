import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Category } from '../category/category.entity';
import { Client } from '../client/client.entity';
import { Technician } from '../technician/technician.entity';
import { TicketStatus, TicketPriority } from '../common/enums/ticket.enum';

@Entity({ name: 'tickets' })
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
  status: TicketStatus;

  @Column({
    type: 'enum',
    enum: TicketPriority,
    default: TicketPriority.MEDIUM,
  })
  priority: TicketPriority;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.tickets, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Client, (client) => client.tickets, { eager: true })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @ManyToOne(
    () => Technician,
    (technician) => technician.tickets,
    { eager: true, nullable: true },
  )
  @JoinColumn({ name: 'technician_id' })
  technician?: Technician;
}
