# GitHub Copilot Instructions

This file contains comprehensive guidelines for AI-assisted development in this project. All code generation, refactoring, and implementation should follow these principles.

---

## Technology Stack

- **NestJS**: v11.x (backend framework)
- **Nx**: Monorepo management
- **TypeScript**: Latest stable
- **Prisma**: ORM for database operations
- **Swagger**: API documentation via `@nestjs/swagger`
- **Jest**: Unit testing framework
- **Supertest**: E2E testing
- **Testcontainers**: Docker-based isolated test databases

---

## Architecture: Domain-Driven Design (DDD)

We follow **Eric Evans' Domain-Driven Design** principles with strict layer separation and mapping at boundaries.

### Core Principle

**Aggregates are the center of the domain.** DTOs never enter the domain layer. Data transformation happens only at layer boundaries via mapping.

### Data Transformation Points

1. **Controller → Application Service**: DTO → primitives
2. **Application Service → Domain**: Primitives → Aggregate (via factory method)
3. **Domain → Persistence**: Aggregate → Database record (via Mapper)
4. **Persistence → Domain**: Database record → Aggregate (via Mapper)
5. **Domain → Controller Response**: Aggregate → DTO (via `fromAggregate()`)

---

## Layer Architecture & Responsibilities

### Layer Overview

| Layer | Folder | Purpose | Key Components |
|-------|--------|---------|-----------------|
| **Presentation** | `dto/` + Controller | Handle HTTP requests, map DTOs | Controllers, Input/Response DTOs |
| **Application** | `application/` | Orchestrate domain objects | Application Services |
| **Domain** | `domain/` | Business logic & rules | Entities, Value Objects, Repository Interfaces |
| **Infrastructure** | `infrastructure/` | Technical capabilities | Repositories, Mappers, Database adapters |

---

## Layer Rules & Responsibilities

### 1. Presentation Layer (Controllers + DTOs)

**Rules:**
- ❌ NO business logic
- ✅ Map DTOs to primitives before calling Application Service
- ✅ Map Aggregates to DTOs before returning responses
- ✅ Use `UserResponseDto.fromAggregate(user)` pattern
- ✅ Validate input with DTOs using `class-validator` decorators

**Key Pattern:**
```typescript
@Controller('users')
export class UserController {
  constructor(private readonly userAppService: UserApplicationService) {}

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    // Extract primitives from DTO
    const user = await this.userAppService.createUser(dto.email, dto.name);
    // Map Aggregate → DTO
    return UserResponseDto.fromAggregate(user);
  }
}
```

### 2. Application Layer (Application Services)

**Rules:**
- ✅ **Thin orchestration only** - NO business rules
- ✅ Receives **primitives** (not DTOs)
- ✅ Returns **Aggregates** (not DTOs)
- ✅ Coordinates transactions and security checks
- ✅ Calls Repository and Domain methods
- ❌ NO business logic or state changes

**Key Pattern:**
```typescript
@Injectable()
export class UserApplicationService {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: IUserRepository) {}

  // Receives primitives, returns Aggregate
  async createUser(email: string, name?: string): Promise<User> {
    const user = User.create(email, name); // Domain creates
    return this.repo.save(user); // Orchestration
  }

  async verifyEmail(userId: string): Promise<User> {
    const user = await this.repo.findById(userId);
    user.verifyEmail(); // Business logic in Domain
    return this.repo.save(user);
  }
}
```

### 3. Domain Layer (Entities, Value Objects, Repository Interfaces)

**Rules:**
- ✅ **Pure TypeScript** - NO NestJS decorators, NO database annotations
- ✅ **Aggregates are the core** - all state changes must go through Aggregate methods
- ✅ Aggregates generate their own IDs using `randomUUID()`
- ✅ All business logic and invariants live here
- ✅ Only works with primitives and other domain objects
- ❌ NO DTOs, NO Infrastructure dependencies, NO Prisma types

**Key Pattern:**
```typescript
export class User {
  private readonly _id: string;
  private _email: string;
  private _name?: string;
  private _emailVerified: boolean = false;
  private _createdAt: Date;
  private _updatedAt: Date;

  // Private constructor - use factory
  private constructor(id: string, email: string, name?: string) {
    this._id = id;
    this._email = email;
    this._name = name;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  // Factory method - generates own ID
  static create(email: string, name?: string): User {
    return new User(randomUUID(), email, name);
  }

  // Business logic - state changes HERE
  verifyEmail(): void {
    this._emailVerified = true;
    this._updatedAt = new Date();
  }

  // Getters for infrastructure/presentation
  get id(): string { return this._id; }
  get email(): string { return this._email; }
  get emailVerified(): boolean { return this._emailVerified; }
}
```

**Repository Interface (Domain):**
```typescript
export interface IUserRepository {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
```

### 4. Infrastructure Layer (Repositories, Mappers)

**Rules:**
- ✅ Implements Repository Interfaces defined in Domain
- ✅ Maps Aggregates ↔ Persistence records using Mapper classes
- ✅ Never expose Prisma types outside this layer
- ✅ Use `toDomain()` and `toPersistence()` methods

**Repository Pattern:**
```typescript
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async save(user: User): Promise<User> {
    const record = UserMapper.toPersistence(user);
    const saved = await this.prisma.user.upsert({
      where: { id: user.id },
      update: record,
      create: record,
    });
    return UserMapper.toDomain(saved);
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    return record ? UserMapper.toDomain(record) : null;
  }
}
```

**Mapper Pattern:**
```typescript
export class UserMapper {
  static toPersistence(user: User): UserModel {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toDomain(raw: UserModel): User {
    return User.reconstruct(
      raw.id,
      raw.email,
      raw.name,
      raw.emailVerified,
      raw.createdAt,
      raw.updatedAt,
    );
  }
}
```

---

## Logic Placement Guide

**Where does each type of logic belong?**

| Logic Type | Location | DO NOT Place In | Example |
|-----------|----------|-----------------|---------|
| **Input Validation** | DTOs (class-validator pipes) | Domain | `@IsEmail()`, `@IsNotEmpty()` |
| **Authentication** | Guards | Domain, Services | `SessionGuard`, `JwtGuard` |
| **Authorization** | Guards, Interceptors | Domain | `AuthzGuard` |
| **Business Invariant** | **Aggregate Root** ⭐ | Services | `user.verifyEmail()`, `order.canBeCancelled()` |
| **State Change** | **Aggregate Root** ⭐ | Services | `user.updateEmail(newEmail)` |
| **Validation of Rules** | **Aggregate Root** ⭐ | Services | `user.addItem()` with inventory checks |
| **Orchestration** | Application Service | Domain | Calling repo + domain methods |
| **DTO Mapping** | Controller / DTO | Domain | `UserResponseDto.fromAggregate()` |
| **Persistence Mapping** | Infrastructure Mapper | Domain | `UserMapper.toDomain()` |
| **Database Operations** | Infrastructure Repository | Services | `prisma.user.save()` |
| **External API Calls** | Infrastructure Service | Domain | API adapters |

---

## Folder Structure Convention

### Module-Based Organization

Each feature is a self-contained module with clear DDD layer separation.

```
src/
├── modules/
│   └── <feature>/
│       ├── application/                      # Application Layer
│       │   ├── <feature>.application-service.ts
│       │   ├── <feature>.application-service.spec.ts
│       │   └── index.ts                      # Barrel export
│       │
│       ├── domain/                           # Domain Layer (Pure TypeScript)
│       │   ├── <feature>.entity.ts           # Aggregate Root
│       │   ├── <feature>.entity.spec.ts
│       │   └── <feature>.repository.interface.ts
│       │
│       ├── infrastructure/                   # Infrastructure Layer
│       │   ├── <feature>.repository.ts       # Prisma implementation
│       │   ├── <feature>.repository.spec.ts
│       │   ├── <feature>.mapper.ts           # Aggregate ↔ Persistence
│       │   ├── <feature>.mapper.spec.ts
│       │   └── <feature>.schema.ts           # (Optional) Prisma types
│       │
│       ├── dto/                              # Data Transfer Objects
│       │   ├── create-<feature>.dto.ts       # Input DTO (with validation)
│       │   ├── update-<feature>.dto.ts       # (if needed)
│       │   └── <feature>-response.dto.ts     # Output DTO
│       │
│       ├── <feature>.controller.ts           # Presentation Layer
│       ├── <feature>.controller.spec.ts
│       └── <feature>.module.ts               # Module definition
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
├── database/
│   ├── database.module.ts
│   └── prisma.service.ts
│
├── config/
│   ├── app.config.ts
│   └── env.schema.ts
│
└── app.module.ts
```

---

## File Naming Conventions

**Consistent naming pattern for all files across layers:**

| Layer | File Pattern | Example |
|-------|--------------|---------|
| **Presentation** | `*.controller.ts` | `user.controller.ts` |
| **Presentation** | `*.controller.spec.ts` | `user.controller.spec.ts` |
| **Application** | `*.application-service.ts` | `user.application-service.ts` |
| **Application** | `*.application-service.spec.ts` | `user.application-service.spec.ts` |
| **Domain Entity** | `*.entity.ts` | `user.entity.ts` |
| **Domain Entity** | `*.entity.spec.ts` | `user.entity.spec.ts` |
| **Domain Interface** | `*.repository.interface.ts` | `user.repository.interface.ts` |
| **Infrastructure** | `*.repository.ts` | `user.repository.ts` |
| **Infrastructure** | `*.repository.spec.ts` | `user.repository.spec.ts` |
| **Infrastructure** | `*.mapper.ts` | `user.mapper.ts` |
| **Infrastructure** | `*.mapper.spec.ts` | `user.mapper.spec.ts` |
| **Infrastructure** | `*.schema.ts` | `user.schema.ts` (optional) |
| **DTOs** | `*.dto.ts` | `create-user.dto.ts`, `user-response.dto.ts` |
| **DTOs** | `*.dto.spec.ts` | (if unit tested) |

**Code Naming:**
- **Files/Folders**: `kebab-case` (e.g., `user-profile.controller.ts`)
- **Classes**: `PascalCase` (e.g., `UserProfileController`)
- **Methods/Variables**: `camelCase` (e.g., `getUserProfile()`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `USER_REPOSITORY`)

---

## Data Flow: Request to Response

**Visual journey of data through the application:**

```
┌──────────────────────────────────────────────────────────────────┐
│ HTTP POST /users { email, name }                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │ UserController      │
                    │ @Post()             │
                    │ create(dto)         │
                    └─────────────────────┘
                              ↓
        ┌─────────────────────────────────────────┐
        │ Extract primitives from DTO             │
        │ createUser(dto.email, dto.name)         │
        └─────────────────────────────────────────┘
                              ↓
                ┌──────────────────────────────┐
                │ UserApplicationService       │
                │ createUser(email, name)      │
                │ (Orchestration only)         │
                └──────────────────────────────┘
                              ↓
            ┌────────────────────────────────┐
            │ User.create(email, name)       │
            │ (Domain - Factory method)      │
            │ Returns: User Aggregate        │
            └────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────┐
        │ this.repo.save(user)                │
        │ (Repository.save(Aggregate))        │
        └─────────────────────────────────────┘
                              ↓
    ┌──────────────────────────────────────────┐
    │ UserMapper.toPersistence(user)           │
    │ Converts Aggregate → Prisma model        │
    └──────────────────────────────────────────┘
                              ↓
            ┌──────────────────────────────┐
            │ PrismaService.user.create()  │
            │ (Database insert)            │
            │ Returns: Prisma model        │
            └──────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────┐
        │ UserMapper.toDomain(record)         │
        │ Converts Prisma model → Aggregate   │
        └─────────────────────────────────────┘
                              ↓
            ┌────────────────────────────────┐
            │ Returns: User Aggregate to Svc │
            └────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────┐
        │ UserResponseDto.fromAggregate(user) │
        │ Maps Aggregate → Response DTO       │
        └─────────────────────────────────────┘
                              ↓
            ┌─────────────────────────────────┐
            │ return UserResponseDto          │
            │ (JSON serialized by NestJS)     │
            └─────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────┐
│ HTTP 201 { id, email, name, createdAt, ... }    │
└──────────────────────────────────────────────────┘
```

---

## Response DTO Example

**Always map from Aggregate using static factory method:**

```typescript
export class UserResponseDto {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Static factory method - required pattern
  static fromAggregate(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.name = user.name;
    dto.emailVerified = user.emailVerified;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
```

---

## Testing Strategy

### Unit Tests

**Purpose:** Test each layer in isolation

**Rules:**
- ✅ Mock all persistence and external dependencies
- ✅ Use `jest.fn()` or mock implementations
- ✅ **Never hit the database**
- ✅ Test at the function/method level

**Location:** Same folder as code, `*.spec.ts` suffix

```bash
npm test        # Run all unit tests
```

**Example:**
```typescript
describe('UserApplicationService', () => {
  let service: UserApplicationService;
  let mockRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
    };
    service = new UserApplicationService(mockRepository);
  });

  it('should create user and save to repository', async () => {
    const user = await service.createUser('test@example.com');
    expect(mockRepository.save).toHaveBeenCalled();
    expect(user.email).toBe('test@example.com');
  });
});
```

### E2E Tests

**Purpose:** Test full workflow including database

**Rules:**
- ✅ Uses **Testcontainers** to spin up isolated PostgreSQL containers
- ✅ Each test run gets a fresh, clean database
- ✅ Migrations are applied automatically
- ✅ Container is destroyed after tests complete
- ✅ Test full request-response cycles

**Location:** `apps/backend-template-e2e/src/` with `.spec.ts` files

```bash
npm run e2e     # Run E2E tests (requires Docker)
```

**Example:**
```typescript
describe('Create User E2E', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Setup is handled by test setup
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('POST /users should create user', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({ email: 'test@example.com', name: 'John' })
      .expect(201);
    
    expect(response.body.email).toBe('test@example.com');
    expect(response.body.id).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
```

---

## Swagger/API Documentation

**Every public endpoint must be documented.**

**Rules:**
- ✅ Controllers: Annotate with `@ApiTags`
- ✅ Methods: Annotate with `@ApiOperation` and `@ApiResponse`
- ✅ DTOs: Annotate properties with `@ApiProperty`

**Example:**
```typescript
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly userAppService: UserApplicationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userAppService.createUser(dto.email, dto.name);
    return UserResponseDto.fromAggregate(user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users', type: [UserResponseDto] })
  async findAll(): Promise<UserResponseDto[]> {
    // ...
  }
}
```

**DTO Properties:**
```typescript
export class CreateUserDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;
}
```

**UI:** Available at `http://localhost:3000/docs` when running locally.

---

## Key Rules (The 5 Invariants)

**Always follow these rules when coding:**

1. **DTOs never enter the domain**
   - Controllers extract primitives and pass them to Application Services
   - Domain only works with Aggregates and primitives
   - ❌ Never pass DTO to domain layer

2. **Aggregates generate their own IDs**
   - Use `randomUUID()` in the static factory method `create()`
   - ❌ Never create ID outside Aggregate
   - ❌ ID generation belongs in domain, not service

3. **State changes happen in Aggregates only**
   - If an operation changes aggregate state, the method belongs ON the Aggregate class
   - ❌ Never modify aggregate state from a service
   - ✅ Services call `aggregate.methodName()`, Aggregate handles change

4. **Application Service is thin (orchestration only)**
   - Receives primitives, calls domain methods, orchestrates repository
   - ❌ NO business logic or conditional state changes
   - ❌ NO complex if/else rules about domain behavior
   - ✅ One line = one logical step (domain call, repo call, etc.)

5. **Mapper handles persistence translation exclusively**
   - Use `toPersistence()` when converting Aggregate → database record
   - Use `toDomain()` when converting database record → Aggregate
   - ❌ Never expose Prisma types outside infrastructure layer
   - ❌ Never let domain know about database structure

---

## Prisma Integration

- **Schema location:** `prisma/schema.prisma`
- **Service location:** `src/database/prisma.service.ts` (global, shared)
- **Migrations:** Stored in `prisma/migrations/`
- **Usage:** Repositories inject `PrismaService` and use `this.prisma.<model>` for operations
- **Type Safety:** Mappers ensure Prisma types never leak into domain

---

## Commit Message Generation

**GitHub Copilot will use these conventions for generating commit messages:**

```json
{
  "github.copilot.chat.commitMessageGeneration.instructions": [
    "Use conventional commit format: type(scope): description.",
    "Use imperative mood: 'Add feature' not 'Added feature'.",
    "Keep subject line under 50 characters.",
    "For additional details, use a well-structured body section with bullet points (*)."
  ]
}
```

**Conventional Commit Format:**

- **type**: `feat` (feature), `fix` (bug fix), `docs` (documentation), `refactor` (code restructure), `test` (tests), `chore` (dependencies/setup)
- **scope**: Module or file affected (optional but recommended for clarity)
- **description**: Brief, imperative mood description

**Examples:**
- `feat(user): add email verification`
- `fix(auth): resolve session timeout issue`
- `docs(readme): update setup instructions`
- `refactor(user-domain): extract email validation logic`

---

## Summary for Code Generation

When generating or modifying code:

✅ **DO:**
- Place business logic in Aggregates (domain entities)
- Use Repository pattern with interfaces in domain
- Map DTOs ↔ Aggregates at layer boundaries
- Keep Application Services thin (pure orchestration)
- Generate own IDs in Aggregate factories
- Use meaningful method names in Aggregates
- Test domain layer without mocking
- Test integration with E2E tests using Testcontainers

❌ **DO NOT:**
- Put business logic in services or controllers
- Pass DTOs to domain layer
- Expose Prisma types outside infrastructure
- Create IDs outside Aggregates
- Skip Swagger documentation on public endpoints
- Modify Aggregate state without calling Aggregate methods
- Mix multiple concerns in Application Service methods
