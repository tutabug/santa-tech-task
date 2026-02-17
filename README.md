# Backend Template

This is a production-ready NestJS backend template within an Nx Monorepo, featuring DDD architecture, Authentication, and Prisma.

## 🚀 Getting Started

### Prerequisites

- Node.js v20+
- Docker & Docker Compose

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment Setup**
   Copy `.env.example` to `.env` and adjust values if needed.

   ```bash
   cp .env.example .env
   ```

   **Required Variables:**
   - `DATABASE_URL`: Connection string for PostgreSQL (e.g., `postgresql://user:pass@localhost:5432/db?schema=public`).
   - `BETTER_AUTH_URL`: The base URL for auth endpoints (e.g., `http://localhost:3000/api/auth`).
   - `BETTER_AUTH_SECRET`: A secure random string for signing session tokens.

3. **Database Setup**
   Start the PostgreSQL container:

   ```bash
   npm run db:up
   ```

   Run migrations:

   ```bash
   npm run db:migrate
   ```

4. **Start Application**
   ```bash
   npm start
   ```
   The API will be available at `http://localhost:3000/api`.
   Swagger Docs: `http://localhost:3000/docs`.

### Docker

You can run the entire stack (App + Database) using Docker Compose:

```bash
docker-compose up -d
```

## 🛠 Features

- **Authentication**: Better-Auth integrated with Prisma (Email/Password supported).
- **Database**: Prisma ORM with PostgreSQL.
- **Logging**: Structured JSON logging with `pino` and context tracking.
- **Architecture**: Domain-Driven Design (DDD) with clear separation of concerns (Domain, Application, Infrastructure, Presentation).
- **Security**: Helmet, CORS, and Zod environment validation.
- **Health Checks**: Ready for k8s/Docker health monitoring (`/health`, `/health/ready`).

## 📁 Structure

- `apps/backend-template/src`:
  - `common`: Shared filters, guards (SessionGuard), interceptors.
  - `config`: Typed configuration with validation.
  - `database`: Prisma service and module.
  - `health`: Health checks.
  - `modules`: Feature modules (e.g., `user`, `auth`).
    - `domain`: Entities, Services, Repository Interfaces.
    - `infrastructure`: Repository Implementations, Mappers.
    - `dto`: Data Transfer Objects.

## 🧪 Testing

Run unit tests (Mocked persistence):

```bash
npm test
```

Run e2e tests:

```bash
npm run e2e
```

_Note: E2E tests require a running database instance as configured in your `.env`._
