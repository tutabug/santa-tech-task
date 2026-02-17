# Architecture: Domain-Driven Design (DDD)

We follow Eric Evans' DDD principles with strict layer separation and mapping at boundaries.

## Core Principle: Aggregates at the Center

The domain layer only works with **Aggregates**. DTOs never enter the domain. Mapping happens at:

- **Controller boundary**: DTO → primitives/command → Application Service
- **Response boundary**: Aggregate → DTO (via `fromAggregate()` static method)
- **Infrastructure boundary**: Aggregate ↔ Database record (via Mapper)

## Layers

### 1. Presentation Layer (Interface)

- **Role**: Handle incoming HTTP requests, WebSocket events, etc.
- **Components**: Controllers, DTOs.
- **Rules**:
  - No business logic.
  - **Map DTOs to primitives** before calling Application Service.
  - **Map Aggregates to DTOs** before returning responses.
  - Use `UserResponseDto.fromAggregate(user)` pattern.

### 2. Application Layer

- **Role**: Orchestrates domain objects to perform a specific task.
- **Components**: Application Services (`*.application-service.ts`).
- **Rules**:
  - **Thin layer** - orchestration only.
  - Does NOT contain business rules.
  - Receives **primitives** (not DTOs).
  - Returns **Aggregates** (not DTOs).
  - Coordinates transactions and security checks.
  - Calls Repository and Domain methods.

### 3. Domain Layer (The Heart)

- **Role**: Represents the business concepts, information, and rules.
- **Components**:
  - **Aggregates/Entities**: **CORE LOGIC HERE**. State changes and invariants must be enforced here.
  - **Value Objects**: Immutable objects (e.g., Email, Money).
  - **Domain Services**: Logic that doesn't fit a single aggregate (stateless, rare).
  - **Repository Interfaces**: Definitions of how to save/retrieve aggregates.
- **Rules**:
  - **No Infrastructure dependencies**.
  - **No DTOs** - only works with Aggregates and primitives.
  - **Aggregate Logic**: If an operation changes the state of an aggregate, the method belongs on the Aggregate class, not a service.

### 4. Infrastructure Layer

- **Role**: Provides technical capabilities.
- **Components**: Repositories, Mappers, External API adapters.
- **Rules**:
  - Implements Repository Interfaces defined in Domain.
  - **Maps Aggregates ↔ Persistence records** using Mapper classes.

## Data Flow Example

```
HTTP Request (CreateUserDto)
    ↓
Controller.create(dto)
    ↓ maps DTO → primitives
Application Service.createUser(email, name)
    ↓
Domain: User.create(email, name)  → returns User aggregate
    ↓
Repository.save(user)  → Mapper.toPersistence(user) → DB
    ↓
Mapper.toDomain(record) → User aggregate
    ↓
UserResponseDto.fromAggregate(user)
    ↓
HTTP Response (JSON)
```

## Logic Placement Guide

| Logic Type              | Location              | Example                              |
| ----------------------- | --------------------- | ------------------------------------ |
| **Input Validation**    | DTOs (pipes)          | `@IsEmail()`                         |
| **Authentication**      | Guards                | `SessionGuard`                       |
| **Business Invariant**  | **Aggregate Root**    | `user.verifyEmail()` (state change)  |
| **Orchestration**       | Application Service   | `createUser()` (calls repo + domain) |
| **DTO Mapping**         | Controller / DTO      | `UserResponseDto.fromAggregate()`    |
| **Persistence Mapping** | Infrastructure Mapper | `UserMapper.toDomain()`              |
| **Data Persistence**    | Infrastructure Repo   | `UserRepository.save()`              |

## File Naming Conventions

| Layer          | File Pattern                | Example                        |
| -------------- | --------------------------- | ------------------------------ |
| Presentation   | `*.controller.ts`           | `user.controller.ts`           |
| Application    | `*.application-service.ts`  | `user.application-service.ts`  |
| Domain Entity  | `*.entity.ts`               | `user.entity.ts`               |
| Domain Repo IF | `*.repository.interface.ts` | `user.repository.interface.ts` |
| Infra Repo     | `*.repository.ts`           | `user.repository.ts`           |
| Infra Mapper   | `*.mapper.ts`               | `user.mapper.ts`               |
| DTOs           | `*.dto.ts`                  | `create-user.dto.ts`           |
