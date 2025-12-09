import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Role } from '../common/enums/role.enum';
import { Client } from '../client/client.entity';
import { Technician } from '../technician/technician.entity';
import { Ticket } from '../ticket/ticket.entity';


@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 150, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @OneToOne(() => Client, (client) => client.user)
  client: Client;

  @OneToOne(() => Technician, (technician) => technician.user)
  technician: Technician;

  @OneToMany(() => Client, (client) => client.user)
  ticketsAsClientUser: Ticket[];

  @OneToMany(() => Ticket, (ticket) => ticket.technician)
  ticketsAsTechnicianUser: Ticket[];
}
