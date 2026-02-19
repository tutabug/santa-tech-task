# Song-Sharing Platform API

A prototype backend API for a song-sharing platform that connects songwriter managers with their songwriters. Built with NestJS, Prisma, PostgreSQL, and better-auth within an Nx monorepo, following Domain-Driven Design principles.

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose

### Quick Start (Docker — recommended)

```bash
git clone <repo-url> && cd santa-tech-task
cp .env.example .env
docker-compose up -d
```

The API will be available at `http://localhost:3000/api`.
Swagger docs at `http://localhost:3000/docs`.

### Local Development

Requires Node.js v20+ in addition to Docker.

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment Setup**

   ```bash
   cp .env.example .env
   ```

   **Required Variables:**
   - `DATABASE_URL`: PostgreSQL connection string (e.g., `postgresql://myuser:mypassword@localhost:5433/mydatabase?schema=public`)
   - `BETTER_AUTH_URL`: Base URL for the app (e.g., `http://localhost:3000`)
   - `BETTER_AUTH_SECRET`: A secure random string for signing session tokens
   - `PORT`: Server port (default: `3000`)

3. **Database Setup**

   ```bash
   npm run db:up        # Start PostgreSQL container
   npm run db:migrate   # Run Prisma migrations
   ```

4. **Start Application**
   ```bash
   npm start
   ```

---

## 📡 API Endpoints

> **Auth note:** All authenticated endpoints require a session cookie obtained via `/auth/sign-in`. In curl, use `-c cookies.txt` to save and `-b cookies.txt` to send cookies.

### Auth

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/auth/sign-up` | Public | Register a new user |
| POST | `/auth/sign-in` | Public | Login |
| POST | `/auth/sign-out` | Session | Logout |

### Users

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/users/me` | Session | Get current user profile |
| GET | `/users` | Session | List all users |
| GET | `/users/:id` | Session | Get user by ID |

### Organizations

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/organizations` | Session | Create organization (creator becomes MANAGER) |
| GET | `/organizations` | Session | List current user's organizations (paginated) |
| POST | `/organizations/:id/members` | Manager | Add member to organization by email |
| GET | `/organizations/:id/members` | Manager | List organization members (paginated)|

### Songs

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/organizations/:id/songs` | Songwriter | Upload a song (multipart, max 50MB) |
| GET | `/organizations/:id/songs` | Member | List songs in organization (paginated) |
| GET | `/organizations/:id/songs/:songId` | Member | Get song details |

### Pitches

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/organizations/:id/songs/:songId/pitches` | Manager | Create a pitch for a song |
| GET | `/organizations/:id/songs/:songId/pitches` | Member | List pitches for a song (paginated) |
| GET | `/organizations/:id/pitches` | Member | List all pitches in organization (paginated) |

### Health

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/health` | Public | Database ping |
| GET | `/health/ready` | Public | Readiness check |

---

## 📝 Example Requests (curl)

### 1. Register & Login

```bash
# Register a manager
curl -s -X POST http://localhost:3000/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"email": "manager@example.com", "password": "password123", "name": "Alice Manager"}' \
  -c cookies.txt

# Login
curl -s -X POST http://localhost:3000/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email": "manager@example.com", "password": "password123"}' \
  -c cookies.txt
```

### 2. Create Organization

```bash
curl -s -X POST http://localhost:3000/organizations \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"name": "Hit Factory", "description": "Top songwriter collective"}'
```

### 3. Register a Songwriter & Add to Organization

```bash
# Register songwriter (in a separate session)
curl -s -X POST http://localhost:3000/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"email": "songwriter@example.com", "password": "password123", "name": "Bob Writer"}'

# Add songwriter to org (as manager, using manager's cookies)
curl -s -X POST http://localhost:3000/organizations/<org-id>/members \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"email": "songwriter@example.com", "role": "SONGWRITER"}'
```

### 4. Upload a Song (as Songwriter)

```bash
# Login as songwriter first
curl -s -X POST http://localhost:3000/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email": "songwriter@example.com", "password": "password123"}' \
  -c songwriter-cookies.txt

# Upload song
curl -s -X POST http://localhost:3000/organizations/<org-id>/songs \
  -b songwriter-cookies.txt \
  -F "file=@/path/to/song.mp3" \
  -F "title=Summer Nights" \
  -F "artist=Bob Writer" \
  -F "duration=210"
```

### 5. Create a Pitch (as Manager)

```bash
curl -s -X POST http://localhost:3000/organizations/<org-id>/songs/<song-id>/pitches \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "description": "Perfect summer anthem for radio play",
    "targetArtists": ["Taylor Swift", "Dua Lipa"],
    "tags": ["pop", "summer", "radio"]
  }'
```

### 6. List Songs & Pitches

```bash
# List songs in org
curl -s http://localhost:3000/organizations/<org-id>/songs -b cookies.txt

# List pitches for a song
curl -s http://localhost:3000/organizations/<org-id>/songs/<song-id>/pitches -b cookies.txt

# List all pitches in org
curl -s http://localhost:3000/organizations/<org-id>/pitches -b cookies.txt
```

---

## 🛠 Features

- **Authentication**: Better-Auth with email/password and session cookies
- **Database**: Prisma ORM with PostgreSQL
- **Architecture**: Domain-Driven Design (DDD) with CQRS-lite (read/write repository split)
- **File Upload**: Multer-based audio upload with MIME type validation (max 50MB)
- **Pagination**: Cursor-based pagination on list endpoints
- **Security**: Helmet, CORS, role-based guards (Manager/Songwriter)
- **Health Checks**: Ready for Docker/k8s monitoring (`/health`, `/health/ready`)
- **API Docs**: Swagger/OpenAPI at `/docs`

## 📁 Structure

- `apps/backend-template/src`:
  - `common`: Shared filters, guards (SessionGuard), interceptors, pagination
  - `config`: Typed configuration with Zod validation
  - `database`: Prisma service and module
  - `health`: Health checks
  - `modules`: Feature modules following DDD layers:
    - `auth`: Better-Auth integration (sign-up, sign-in, sign-out)
    - `user`: User profile management
    - `organization`: Organizations and member management
    - `song`: Songs, pitches, and file uploads
      - `domain`: Entities, repository interfaces
      - `application`: Use cases, read repositories
      - `infrastructure`: Prisma repositories, mappers
      - `dto`: Input and response DTOs

## 🧪 Testing

```bash
npm test       # Unit tests
npm run e2e    # E2E tests (requires Docker)
```

## 📋 Assumptions

See [SOLUTION.md](SOLUTION.md#assumptions) for detailed assumptions and design decisions.
