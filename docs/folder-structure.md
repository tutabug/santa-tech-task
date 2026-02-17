# Folder Structure Convention

We follow a module-based structure where each feature is a self-contained module with clear DDD layer separation.

## Example: User Module (`src/modules/user/`)

```
src/
├── modules/
│   └── user/
│       ├── application/                      # Application Layer
│       │   ├── user.application-service.ts   # Orchestration (no business logic)
│       │   ├── user.application-service.spec.ts
│       │   └── index.ts                      # Barrel export
│       │
│       ├── domain/                           # Domain Layer (Pure TypeScript)
│       │   ├── user.entity.ts                # Aggregate Root (BUSINESS LOGIC)
│       │   ├── user.entity.spec.ts
│       │   └── user.repository.interface.ts  # Repository contract
│       │
│       ├── infrastructure/                   # Infrastructure Layer
│       │   ├── user.repository.ts            # Prisma implementation
│       │   ├── user.repository.spec.ts
│       │   ├── user.mapper.ts                # Aggregate ↔ Persistence
│       │   ├── user.mapper.spec.ts
│       │   └── user.schema.ts                # (Optional) Prisma type definitions
│       │
│       ├── dto/                              # Data Transfer Objects
│       │   ├── create-user.dto.ts            # Input DTO (with validation)
│       │   └── user-response.dto.ts          # Output DTO (with fromAggregate)
│       │
│       ├── user.controller.ts                # Presentation Layer
│       ├── user.controller.spec.ts
│       └── user.module.ts                    # Module definition
│
├── common/                                   # Shared across modules
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── public.decorator.ts
│   ├── guards/
│   │   └── session.guard.ts
│   ├── filters/
│   │   └── global-exception.filter.ts
│   └── interceptors/
│       └── response.interceptor.ts
│
├── database/                                 # Database infrastructure
│   ├── database.module.ts
│   └── prisma.service.ts
│
└── config/                                   # Configuration
    ├── app.config.ts
    └── env.schema.ts
```

## Layer Details

### 1. Domain (`domain/`)

- **Location**: `src/modules/<feature>/domain/`
- **Content**: Pure TypeScript classes. No NestJS decorators or database annotations.
- **Key File**: `*.entity.ts` - Aggregate Root with all business logic.
- **Rules**:
  - Entities generate their own IDs (e.g., `randomUUID()` in factory method).
  - All state changes happen through aggregate methods.
  - No dependencies on infrastructure or DTOs.

### 2. Application (`application/`)

- **Location**: `src/modules/<feature>/application/`
- **Content**: NestJS Services with `@Injectable()`.
- **Key File**: `*.application-service.ts` - Orchestration layer.
- **Rules**:
  - Receives **primitives** from controller.
  - Returns **Aggregates** to controller.
  - Does NOT handle DTOs (that's presentation's job).
  - Thin layer - no business logic.

### 3. Infrastructure (`infrastructure/`)

- **Location**: `src/modules/<feature>/infrastructure/`
- **Content**:
  - **Repositories**: Implement domain interfaces using Prisma.
  - **Mappers**: Convert between Aggregates and database records.
- **Rules**:
  - Mapper uses `toDomain()` and `toPersistence()` methods.
  - Repository only works with Aggregates, never raw records.

### 4. Presentation (`dto/` + Controller)

- **Location**: DTOs in `src/modules/<feature>/dto/`, Controller at module root.
- **Content**:
  - **Input DTOs**: With `class-validator` decorators.
  - **Response DTOs**: With `fromAggregate()` static mapper.
  - **Controller**: Maps DTOs ↔ primitives/aggregates.
- **Rules**:
  - Controller extracts primitives from DTOs before calling Application Service.
  - Controller maps returned Aggregates to Response DTOs.

## Mapping Flow

```
┌─────────────┐     primitives     ┌─────────────────┐     Aggregate     ┌─────────────┐
│ Controller  │ ─────────────────► │ Application Svc │ ◄───────────────► │   Domain    │
│   + DTOs    │ ◄───────────────── │                 │                   │  (Entity)   │
└─────────────┘   fromAggregate()  └─────────────────┘                   └─────────────┘
                                           │                                    ▲
                                           │ save(aggregate)                    │
                                           ▼                                    │
                                   ┌─────────────────┐     toDomain()    ┌─────────────┐
                                   │   Repository    │ ◄───────────────► │   Mapper    │
                                   │ (Infrastructure)│  toPersistence()  └─────────────┘
                                   └─────────────────┘
                                           │
                                           ▼
                                   ┌─────────────────┐
                                   │     Prisma      │
                                   │   (Database)    │
                                   └─────────────────┘
```

## Prisma Integration

- Prisma schema lives in `prisma/schema.prisma`.
- `PrismaService` is a global shared service in `DatabaseModule`.
- Repositories inject `PrismaService` for database operations.
- **Never expose Prisma types to domain** - always map through Mapper.
