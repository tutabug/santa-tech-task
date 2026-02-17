# Project Conventions

## Architecture

- Refer to [Architecture Guide](./architecture.md) for DDD layer definitions.
- Refer to [Folder Structure](./folder-structure.md) for file organization.

## Layer Responsibilities

### Controller (Presentation)

```typescript
@Controller('users')
export class UserController {
  constructor(private readonly userAppService: UserApplicationService) {}

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    // Map DTO → primitives
    const user = await this.userAppService.createUser(dto.email, dto.name);
    // Map Aggregate → DTO
    return UserResponseDto.fromAggregate(user);
  }
}
```

### Application Service

```typescript
@Injectable()
export class UserApplicationService {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: IUserRepository) {}

  // Receives primitives, returns Aggregate
  async createUser(email: string, name?: string): Promise<User> {
    const user = User.create(email, name); // Domain creates
    return this.repo.save(user); // Orchestration
  }
}
```

### Domain Entity (Aggregate)

```typescript
export class User {
  private constructor(/* ... */) {}

  // Factory - generates own ID
  static create(email: string, name?: string): User {
    return new User(randomUUID(), email, name /* ... */);
  }

  // Business logic - state changes HERE
  verifyEmail(): void {
    this._emailVerified = true;
    this._updatedAt = new Date();
  }
}
```

### Response DTO

```typescript
export class UserResponseDto {
  // Static mapper from Aggregate
  static fromAggregate(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    // ...
    return dto;
  }
}
```

## Naming

- Files: `kebab-case` (e.g., `user-profile.controller.ts`)
- Classes: `PascalCase` (e.g., `UserProfileController`)
- Methods/Variables: `camelCase`
- Application Services: `*.application-service.ts`
- Entities: `*.entity.ts`
- Repository Interfaces: `*.repository.interface.ts`
- Repository Implementations: `*.repository.ts`

## Testing Strategy

### Unit Tests

- Must mock all persistence and external dependencies.
- Use `jest.fn()` or mock implementations.
- **Never hit the database** in unit tests.
- Test each layer in isolation.

### E2E Tests

- Uses **Testcontainers** to spin up isolated PostgreSQL containers.
- Each test run gets a fresh, clean database.
- Migrations are applied automatically.
- Container is destroyed after tests complete.

Run tests:

```bash
npm test        # Unit tests
npm run e2e     # E2E tests (requires Docker)
```

## Swagger Policy

Every public endpoint must be documented.

1. **Controllers**: Annotate with `@ApiTags`.
2. **Methods**: Annotate with `@ApiOperation` and `@ApiResponse`.
3. **DTOs**: Annotate properties with `@ApiProperty`.

Example:

```typescript
@ApiTags('users')
@Controller('users')
export class UsersController {
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users', type: [UserResponseDto] })
  findAll(): Promise<UserResponseDto[]> {}
}
```

## Key Rules

1. **DTOs never enter the domain** - Controller extracts primitives.
2. **Aggregates generate their own IDs** - Use `randomUUID()` in factory.
3. **State changes happen in Aggregates** - Not in services.
4. **Application Service is thin** - Orchestration only.
5. **Mapper handles persistence translation** - `toDomain()` / `toPersistence()`.
