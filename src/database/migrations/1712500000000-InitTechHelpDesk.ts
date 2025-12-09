import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitTechHelpDesk1712500000000 implements MigrationInterface {
  name = 'InitTechHelpDesk1712500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('ADMIN', 'TECHNICIAN', 'CLIENT');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_status') THEN
          CREATE TYPE ticket_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_priority') THEN
          CREATE TYPE ticket_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
        END IF;
      END
      $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(100) NOT NULL,
        email       VARCHAR(150) NOT NULL UNIQUE,
        password    VARCHAR(255) NOT NULL,
        role        user_role NOT NULL
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id             SERIAL PRIMARY KEY,
        name           VARCHAR(100) NOT NULL,
        company        VARCHAR(150),
        contact_email  VARCHAR(150) NOT NULL,
        user_id        INTEGER UNIQUE,
        CONSTRAINT fk_clients_user
          FOREIGN KEY (user_id)
          REFERENCES users (id)
          ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS technicians (
        id           SERIAL PRIMARY KEY,
        name         VARCHAR(100) NOT NULL,
        specialty    VARCHAR(150),
        availability BOOLEAN NOT NULL DEFAULT TRUE,
        user_id      INTEGER UNIQUE,
        CONSTRAINT fk_technicians_user
          FOREIGN KEY (user_id)
          REFERENCES users (id)
          ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id          SERIAL PRIMARY KEY,
        name        VARCHAR(100) NOT NULL UNIQUE,
        description TEXT
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id             SERIAL PRIMARY KEY,
        title          VARCHAR(200) NOT NULL,
        description    TEXT NOT NULL,
        status         ticket_status NOT NULL DEFAULT 'OPEN',
        priority       ticket_priority NOT NULL DEFAULT 'MEDIUM',
        created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        category_id    INTEGER NOT NULL,
        client_id      INTEGER NOT NULL,
        technician_id  INTEGER,
        CONSTRAINT fk_tickets_category
          FOREIGN KEY (category_id)
          REFERENCES categories (id),
        CONSTRAINT fk_tickets_client
          FOREIGN KEY (client_id)
          REFERENCES clients (id),
        CONSTRAINT fk_tickets_technician
          FOREIGN KEY (technician_id)
          REFERENCES technicians (id)
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_tickets_technician_status
        ON tickets (technician_id, status);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {


    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_tickets_technician_status;
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS tickets;
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS categories;
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS technicians;
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS clients;
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS users;
    `);

    await queryRunner.query(`DROP TYPE IF EXISTS ticket_priority;`);
    await queryRunner.query(`DROP TYPE IF EXISTS ticket_status;`);
    await queryRunner.query(`DROP TYPE IF EXISTS user_role;`);
  }
}
