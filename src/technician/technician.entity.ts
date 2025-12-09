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

@Entity({ name: 'technicians' })
export class Technician {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 150, nullable: true })
  specialty?: string;

  @Column({ default: true })
  availability: boolean;

  @OneToOne(() => User, (user) => user.technician, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Ticket, (ticket) => ticket.technician)
  tickets: Ticket[];
}
