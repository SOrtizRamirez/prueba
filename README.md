# TechHelpDesk API – Backend Documentation

A complete Help Desk Management API built with **NestJS**, **TypeORM**, and **PostgreSQL**.  
TechHelpDesk provides ticket creation, assignment, status workflows, role-based access control, and administrative CRUD operations.

---

## 📌 Overview

TechHelpDesk is a modular backend system designed to support IT ticketing workflows inside an organization.

It includes:

- 🔐 JWT Authentication & Authorization  
- 👥 User roles: **ADMIN**, **CLIENT**, **TECHNICIAN**  
- 🎫 Ticket management system with business rules  
- 🧩 Category & User Administration (Admin only)  
- 🔄 Controlled ticket state transitions  
- 🚧 Limit of **5 simultaneous IN_PROGRESS** tickets per technician  
- 🧪 Automated Unit Tests  
- ✔️ DTO validation with `class-validator`  
- 🚨 Global Error Handler using a custom `ExceptionFilter`  
- 📚 Auto-generated Swagger Documentation  

---

## 🏗️ Architecture

```
src/
  auth/
  category/
  client/
  common/
    decorators/
    enums/
    filters/
    guards/
    interceptors/
  database/
    migrations/
    seeders/
    datasource.ts
  technician/
  ticket/
  user/
  app.module.ts
  main.ts
```

### Key Concepts:

- **Modular structure** following NestJS best practices  
- **TypeORM entities** reflect PostgreSQL schema  
- **DTO + Validation Pipes** enforce clean input  
- **Guards and Decorators** enforce RBAC (role-based access control)  

---

## 🚀 Tech Stack

| Technology | Purpose |
|-----------|----------|
| **NestJS** | API architecture, DI, modules |
| **TypeORM** | ORM for PostgreSQL |
| **PostgreSQL** | Relational database |
| **JWT** | Authentication |
| **class-validator** | Data validation |
| **Jest** | Unit testing |
| **Swagger** | API documentation |

---

## 📦 Installation

### 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd tech-helpdesk
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Environment Variables

Create a `.env` file based on the example:

**`.env`**  
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_user
DB_PASS=your_password
DB_NAME=tech_helpdesk

JWT_SECRET=super_secret_key
JWT_EXPIRES_IN=3600s
```

---

## 🗄️ Database Setup

### 4️⃣ Run Migrations

```bash
npm run migration:run
```

### 5️⃣ Seed Initial Data

```bash
npm run seed
```

Seeds include:

- 1 Admin  
- 2 Clients  
- 2 Technicians  
- 3 Categories  
- Sample Tickets  

---

## ▶️ Start the Server

```bash
npm run start:dev
```

API will be available at:

```
http://localhost:3000
```

---

## 🔐 Authentication

Login with:

```json
POST /auth/login
{
  "email": "admin@techhelpdesk.com",
  "password": "Admin123!"
}
```

Response:

```json
{
  "accessToken": "<jwt>",
  "user": { "id": 1, "role": "ADMIN" }
}
```

Use the token in all protected endpoints:

```
Authorization: Bearer <jwt>
```

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full CRUD on Users & Categories, view all tickets |
| **CLIENT** | Create tickets, view their own ticket history |
| **TECHNICIAN** | Manage assigned tickets, change ticket status |

---

## 🎫 Ticket Management Endpoints

### 1. Create Ticket (Client/Admin)

```
POST /tickets
```

Body:
```json
{
  "title": "Cannot access ERP system",
  "description": "Stuck loading and then fails.",
  "priority": "HIGH",
  "categoryId": 3,
  "clientId": 1,
  "technicianId": 2
}
```

---

### 2. Update Ticket Status (Technician/Admin)

```
PATCH /tickets/:id/status
```

Body:
```json
{
  "status": "IN_PROGRESS"
}
```

---

### Allowed State Transitions:

| From | To | Allowed |
|------|-----|----------|
| OPEN | IN_PROGRESS | ✔️ |
| IN_PROGRESS | RESOLVED | ✔️ |
| RESOLVED | CLOSED | ✔️ |
| OPEN | CLOSED | ❌ invalid |

---

### Business Rule:
⚠️ A technician **cannot have more than 5 IN_PROGRESS tickets**.  

---

### 3. Get Tickets by Client

```
GET /tickets/client/:id
```

### 4. Get Tickets by Technician

```
GET /tickets/technician/:id
```

---

## 👤 User Management (Admin Only)

### Create User
```
POST /users
```

### Retrieve Users
```
GET /users
```

### Update User
```
PATCH /users/:id
```

### Delete User
```
DELETE /users/:id
```

---

## 🏷️ Category Management (Admin Only)

### Create Category
```
POST /categories
```

### List Categories
```
GET /categories
```

### Update Category
```
PATCH /categories/:id
```

### Delete Category
```
DELETE /categories/:id
```

---

## 🧪 Unit Testing

Run all tests:

```bash
npm run test
```

Coverage:

```bash
npm run test:cov
```

Included tests:

- Ticket creation  
- State transition validations  
- Business rule: 5 concurrent IN_PROGRESS tickets per technician  

---

## 📚 Swagger Documentation

Once running:

```
http://localhost:3000/api
```

Features:

- Bearer token authentication  
- Complete DTO definitions  
- CRUD operations  
- Ticket workflows  

---

## 🧠 Validation Layer

All DTOs use:

- @IsNotEmpty  
- @IsEmail  
- @IsEnum  
- @IsInt  
- @MinLength  

Invalid input results in standardized 400 responses.

---

## 🚨 Error Handling

The custom **HttpExceptionFilter** ensures all errors follow the structure:

```json
{
  "success": false,
  "statusCode": 400,
  "path": "/tickets",
  "method": "POST",
  "timestamp": "...",
  "error": {
    "message": "Descriptive error"
  }
}
```

---

## 📌 Summary

TechHelpDesk is a production-ready backend API with:

- Modular NestJS design  
- Secure authentication  
- Strong role-based authorization  
- Business logic enforcement  
- Complete admin panel backend  
- Full validations and error handling  
- Comprehensive documentation  

Perfect foundation for a real-world Help Desk system.

## Testing

This project includes unit tests written with Jest to verify the core business rules of the Help Desk.

✅ Implemented Unit Tests

The main unit tests are focused on the TicketService:

src/ticket/ticket.service.spec.ts

Ticket creation

Verifies that a ticket is successfully created when:

The CLIENT or ADMIN role is used.

The provided categoryId, clientId, and technicianId exist.

The ticket is initialized with status OPEN.

Also verifies that a ForbiddenException is thrown if a user with a different role (e.g. TECHNICIAN) tries to create a ticket.

Ticket status change

Verifies a valid transition from OPEN → IN_PROGRESS for a technician.

Checks that the query to count technician tickets in IN_PROGRESS is executed to enforce the business rule.

Verifies that a BadRequestException is thrown for an invalid transition (e.g. OPEN → CLOSED).

Verifies that a NotFoundException is thrown when attempting to update a non-existing ticket.

These tests mock the underlying TypeORM repositories using getRepositoryToken() and do not hit the real database.

## Running the Tests

To run all tests:

npm run test


To generate coverage:

npm run test:cov


The coverage report is displayed in the terminal and also generated in the coverage/ folder.

For this project, the minimum required coverage of 40% is achieved, with the TicketService having its main business logic (ticket creation and status transitions) covered by Jest unit tests.


## Made By:

Riwi's coder Sharon Ortiz.
Clan Ubuntu