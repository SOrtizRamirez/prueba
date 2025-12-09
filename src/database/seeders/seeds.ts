// src/database/seeds/seed.ts
import 'reflect-metadata';
import dataSource from '../datasource';

import { User } from '../../users/users.entity';
import { Client } from '../../client/client.entity';
import { Technician } from '../../technician/technician.entity';
import { Category } from '../../category/category.entity';
import { Ticket } from '../../ticket/ticket.entity';

import { Role } from '../../common/enums/role.enum';
import { TicketStatus, TicketPriority } from '../../common/enums/ticket.enum';

import * as bcrypt from 'bcrypt';


async function seedUsers() {
  const userRepo = dataSource.getRepository(User);

  const count = await userRepo.count();
  if (count > 0) {
    console.log('👤 Users ya tienen datos, saltando...');
    return;
  }

  const passwordAdmin = await bcrypt.hash('Admin123*', 10);
  const passwordTech = await bcrypt.hash('Tech123*', 10);
  const passwordClient = await bcrypt.hash('Client123*', 10);

  const usersData: Partial<User>[] = [
    {
      name: 'Admin Soporte Global',
      email: 'admin@techhelpdesk.com',
      password: passwordAdmin,
      role: Role.ADMIN,
    },
    {
      name: 'Tecnico Hardware',
      email: 'tech.hardware@techhelpdesk.com',
      password: passwordTech,
      role: Role.TECHNICIAN,
    },
    {
      name: 'Tecnico Software',
      email: 'tech.software@techhelpdesk.com',
      password: passwordTech,
      role: Role.TECHNICIAN,
    },
    {
      name: 'Cliente Alpha',
      email: 'cliente.alpha@empresa.com',
      password: passwordClient,
      role: Role.CLIENT,
    },
    {
      name: 'Cliente Beta',
      email: 'cliente.beta@empresa.com',
      password: passwordClient,
      role: Role.CLIENT,
    },
  ];

  const users = usersData.map((data) => userRepo.create(data));
  await userRepo.save(users);

  console.log('Users sembrados');
}

async function seedClients() {
  const clientRepo = dataSource.getRepository(Client);
  const userRepo = dataSource.getRepository(User);

  const count = await clientRepo.count();
  if (count > 0) {
    console.log('👥 Clients ya tienen datos, saltando...');
    return;
  }

  const clientUsers = await userRepo.find({
    where: { role: Role.CLIENT },
  });

  if (clientUsers.length < 2) {
    console.warn(
      'No hay suficientes usuarios con rol CLIENT para crear clients. Asegúrate de haber corrido seedUsers primero.',
    );
    return;
  }

  const [clientUserAlpha, clientUserBeta] = clientUsers;

  const clientsData: Partial<Client>[] = [
    {
      name: 'Cliente Alpha',
      company: 'Empresa Alpha S.A.S.',
      contactEmail: 'soporte@empresa-alpha.com',
      user: clientUserAlpha,
    },
    {
      name: 'Cliente Beta',
      company: 'Empresa Beta LTDA',
      contactEmail: 'it@empresa-beta.com',
      user: clientUserBeta,
    },
  ];

  const clients = clientsData.map((data) => clientRepo.create(data));
  await clientRepo.save(clients);

  console.log('Clients sembrados');
}

async function seedTechnicians() {
  const technicianRepo = dataSource.getRepository(Technician);
  const userRepo = dataSource.getRepository(User);

  const count = await technicianRepo.count();
  if (count > 0) {
    console.log('Technicians ya tienen datos, saltando...');
    return;
  }

  const technicianUsers = await userRepo.find({
    where: { role: Role.TECHNICIAN },
  });

  if (technicianUsers.length < 2) {
    console.warn(
      'No hay suficientes usuarios con rol TECHNICIAN para crear technicians. Corre seedUsers primero.',
    );
    return;
  }

  const [hardwareUser, softwareUser] = technicianUsers;

  const techniciansData: Partial<Technician>[] = [
    {
      name: 'Tecnico Hardware',
      specialty: 'Equipos físicos, redes, cableado estructurado',
      availability: true,
      user: hardwareUser,
    },
    {
      name: 'Tecnico Software',
      specialty: 'Sistemas operativos, aplicaciones y sistemas corporativos',
      availability: true,
      user: softwareUser,
    },
  ];

  const technicians = techniciansData.map((data) =>
    technicianRepo.create(data),
  );
  await technicianRepo.save(technicians);

  console.log('Technicians sembrados');
}


async function seedCategories() {
  const categoryRepo = dataSource.getRepository(Category);

  const count = await categoryRepo.count();
  if (count > 0) {
    console.log('Categories ya tienen datos, saltando...');
    return;
  }

  const categoriesData: Partial<Category>[] = [
    {
      name: 'Solicitud',
      description:
        'Requerimientos de servicio no críticos (altas de usuario, accesos, configuraciones menores).',
    },
    {
      name: 'Incidente de Hardware',
      description:
        'Fallas en equipos físicos: computadores, impresoras, servidores, cableado.',
    },
    {
      name: 'Incidente de Software',
      description:
        'Errores en aplicaciones, sistemas operativos, sistemas corporativos y licencias.',
    },
  ];

  const categories = categoriesData.map((data) =>
    categoryRepo.create(data),
  );
  await categoryRepo.save(categories);

  console.log('Categories sembradas');
}


async function seedTickets() {
  const ticketRepo = dataSource.getRepository(Ticket);
  const clientRepo = dataSource.getRepository(Client);
  const technicianRepo = dataSource.getRepository(Technician);
  const categoryRepo = dataSource.getRepository(Category);

  const count = await ticketRepo.count();
  if (count > 0) {
    console.log('Tickets ya tienen datos, saltando...');
    return;
  }

  const clients = await clientRepo.find();
  const technicians = await technicianRepo.find();
  const categories = await categoryRepo.find();

  if (clients.length < 2 || technicians.length < 2 || categories.length < 3) {
    console.warn(
      'No hay suficientes Clients / Technicians / Categories para crear tickets. Asegúrate de haber corrido los otros seeds primero.',
    );
    return;
  }

  const [clientAlpha, clientBeta] = clients;
  const [techHardware, techSoftware] = technicians;

  const solicitud = categories.find((c) => c.name === 'Solicitud');
  const incidenteHw = categories.find(
    (c) => c.name === 'Incidente de Hardware',
  );
  const incidenteSw = categories.find(
    (c) => c.name === 'Incidente de Software',
  );

  if (!solicitud || !incidenteHw || !incidenteSw) {
    console.warn('No se encontraron las categorías esperadas.');
    return;
  }

  const ticketsData: Partial<Ticket>[] = [
    {
      title: 'Creación de usuario en ERP',
      description:
        'Se requiere creación de usuario para nuevo analista contable en el sistema ERP corporativo.',
      status: TicketStatus.OPEN,
      priority: TicketPriority.LOW,
      category: solicitud,
      client: clientAlpha,
      technician: techSoftware,
    },
    {
      title: 'Servidor de archivos no enciende',
      description:
        'El servidor de archivos del piso 3 no responde y no enciende desde las 7:00 a.m.',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.HIGH,
      category: incidenteHw,
      client: clientBeta,
      technician: techHardware,
    },
    {
      title: 'Error al generar reportes en sistema de nómina',
      description:
        'Al intentar generar el reporte mensual de nómina, el sistema muestra un error de base de datos.',
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.MEDIUM,
      category: incidenteSw,
      client: clientAlpha,
      technician: techSoftware,
    },
    {
      title: 'Impresora de facturación atascada',
      description:
        'La impresora de facturación de la sede principal presenta atascos frecuentes de papel.',
      status: TicketStatus.RESOLVED,
      priority: TicketPriority.MEDIUM,
      category: incidenteHw,
      client: clientBeta,
      technician: techHardware,
    },
  ];

  const tickets = ticketsData.map((data) => ticketRepo.create(data));
  await ticketRepo.save(tickets);

  console.log('Tickets sembrados');
}


async function runSeed() {
  try {
    await dataSource.initialize();
    console.log('Iniciando seed de TechHelpDesk...');

    await seedUsers();
    await seedClients();
    await seedTechnicians();
    await seedCategories();
    await seedTickets();

    console.log('Seeds de TechHelpDesk completados correctamente');
  } catch (error) {
    console.error('Error ejecutando seeds', error);
  } finally {
    await dataSource.destroy();
  }
}

runSeed();
