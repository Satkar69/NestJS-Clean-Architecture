# Clean Architecture Project Structure

This project follows **Clean Architecture** principles with the **Dependency Rule**: dependencies point inward, never outward.

## 📐 Architecture Layers

```
┌─────────────────────────────────────────────┐
│          🎨 Presentation Layer              │
│     (Controllers, Guards, Filters)          │
├─────────────────────────────────────────────┤
│       🏗️  Infrastructure Layer              │
│  (Repositories, External Services, Config)  │
├─────────────────────────────────────────────┤
│        💼 Application Layer                 │
│    (Use Cases, DTOs, Ports/Interfaces)      │
├─────────────────────────────────────────────┤
│          🎯 Domain Layer                    │
│    (Entities, Value Objects, Events)        │
└─────────────────────────────────────────────┘
```

## 📁 Folder Structure

```
src/
├── core/                          # Core business logic (innermost layers)
│   ├── domain/                    # Enterprise business rules
│   │   ├── entities/              # Domain entities (business objects)
│   │   ├── value-objects/         # Immutable value objects
│   │   └── events/                # Domain events
│   └── application/               # Application business rules
│       ├── use-cases/             # Application use cases/services
│       ├── dto/                   # Data Transfer Objects
│       └── ports/                 # Interfaces/Contracts
│           ├── in/                # Input ports (use case interfaces)
│           └── out/               # Output ports (repository, services)
│
├── infrastructure/                # External concerns (frameworks & tools)
│   ├── persistence/               # Database implementations
│   │   ├── repositories/          # Repository implementations
│   │   └── entities/              # ORM entities (TypeORM, Prisma, etc.)
│   ├── external-services/         # Third-party API integrations
│   └── config/                    # Configuration files
│
├── presentation/                  # HTTP/API layer
│   ├── controllers/               # REST/GraphQL controllers
│   ├── guards/                    # Authentication/authorization guards
│   ├── filters/                   # Exception filters
│   ├── interceptors/              # Request/response interceptors
│   ├── pipes/                     # Validation pipes
│   └── middlewares/               # HTTP middlewares
│
├── shared/                        # Shared utilities (cross-cutting)
│   ├── constants/                 # Application constants
│   ├── utils/                     # Utility functions
│   ├── exceptions/                # Custom exceptions
│   └── decorators/                # Custom decorators
│
├── app.module.ts                  # Root application module
└── main.ts                        # Application entry point
```

## 🎯 The Dependency Rule

**Key Principle**: Source code dependencies must point **inward only**.

- ✅ **Allowed**: `Presentation → Application → Domain`
- ✅ **Allowed**: `Infrastructure → Application → Domain`
- ❌ **Forbidden**: `Domain → Application`
- ❌ **Forbidden**: `Application → Infrastructure`
- ❌ **Forbidden**: `Domain → Infrastructure`

### Dependency Flow Examples

```typescript
// ✅ CORRECT: Controller depends on Use Case (inward)
import { CreateUserUseCase } from '../../core/application/use-cases/create-user.use-case';

// ✅ CORRECT: Use Case depends on Domain Entity (inward)
import { User } from '../../domain/entities/user.entity';

// ✅ CORRECT: Use Case depends on Port (interface)
import { UserRepositoryPort } from '../ports/out/user.repository.port';

// ✅ CORRECT: Repository implements Port (inward dependency via DI)
export class TypeOrmUserRepository implements UserRepositoryPort {}

// ❌ WRONG: Domain depending on infrastructure
import { TypeOrmUserRepository } from '../../infrastructure/...';
```

## 📦 Layer Responsibilities

### 🎯 Core/Domain

**No dependencies on any other layers**

- **Purpose**: Enterprise-wide business rules
- **Contains**: Entities, Value Objects, Domain Events
- **Rules**:
  - Pure TypeScript/JavaScript
  - No framework dependencies
  - No database concerns
  - No HTTP concerns

**Example**:

```typescript
// user.entity.ts
export class User {
  constructor(
    private readonly id: string,
    private email: string,
  ) {}

  updateEmail(newEmail: string): void {
    if (!this.isValidEmail(newEmail)) {
      throw new Error('Invalid email');
    }
    this.email = newEmail;
  }
}
```

### 💼 Core/Application

**Depends only on Domain**

- **Purpose**: Application-specific business rules
- **Contains**: Use Cases, DTOs, Ports (Interfaces)
- **Rules**:
  - Orchestrates domain entities
  - Defines interfaces for infrastructure
  - Framework independent
  - Contains business logic flow

**Example**:

```typescript
// create-user.use-case.ts
@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort, // ← Interface!
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const user = new User(this.generateId(), dto.email);
    return await this.userRepository.save(user);
  }
}
```

### 🏗️ Infrastructure

**Implements Application layer interfaces**

- **Purpose**: External concerns (DB, APIs, File System)
- **Contains**: Repository implementations, API clients, Configurations
- **Rules**:
  - Implements ports from application layer
  - Framework-specific code lives here
  - Database access implementations
  - External service integrations

**Example**:

```typescript
// typeorm-user.repository.ts
@Injectable()
export class TypeOrmUserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async save(user: User): Promise<User> {
    const entity = this.toEntity(user);
    await this.repository.save(entity);
    return user;
  }
}
```

### 🎨 Presentation

**Depends on Application layer**

- **Purpose**: Handle HTTP requests/responses
- **Contains**: Controllers, Guards, Filters, Pipes
- **Rules**:
  - Thin layer - delegate to use cases
  - Handle HTTP concerns only
  - Transform requests to DTOs
  - Transform domain objects to responses

**Example**:

```typescript
// user.controller.ts
@Controller('users')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return await this.createUserUseCase.execute(dto);
  }
}
```

### 🔧 Shared

**Can be used by any layer**

- **Purpose**: Cross-cutting concerns
- **Contains**: Utils, Constants, Common Exceptions
- **Rules**:
  - No business logic
  - Generic and reusable
  - No layer-specific code

## 🔌 Dependency Injection Pattern

Use **Ports and Adapters** (Hexagonal Architecture):

1. **Define Port** (interface) in `core/application/ports/out/`:

```typescript
export interface UserRepositoryPort {
  save(user: User): Promise<User>;
}
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
```

2. **Use Port** in Use Case:

```typescript
constructor(
  @Inject(USER_REPOSITORY)
  private readonly userRepository: UserRepositoryPort,
) {}
```

3. **Implement Port** in Infrastructure:

```typescript
export class TypeOrmUserRepository implements UserRepositoryPort {
  async save(user: User): Promise<User> {
    /* implementation */
  }
}
```

4. **Register in Module**:

```typescript
@Module({
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
  ],
})
export class UserModule {}
```

## 🧪 Testing Strategy

### Unit Tests

- **Domain Entities**: Test business logic in isolation
- **Use Cases**: Mock ports/repositories
- **Value Objects**: Test validation and behavior

### Integration Tests

- **Repositories**: Test with actual database
- **Controllers**: Test HTTP layer with mocked use cases

### E2E Tests

- **Full Flow**: Test complete user scenarios

## ✅ Benefits

1. **Testability**: Core business logic is isolated and easy to test
2. **Maintainability**: Clear separation of concerns
3. **Flexibility**: Easy to swap implementations (databases, frameworks)
4. **Scalability**: Organized structure supports growth
5. **Framework Independence**: Core logic doesn't depend on NestJS

## 🚀 Getting Started

1. **Create Domain Entity** in `core/domain/entities/`
2. **Define Use Case** in `core/application/use-cases/`
3. **Create DTOs** in `core/application/dto/`
4. **Define Ports** in `core/application/ports/out/`
5. **Implement Repository** in `infrastructure/persistence/repositories/`
6. **Create Controller** in `presentation/controllers/`
7. **Wire Dependencies** in modules

## 📚 Additional Resources

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [NestJS Documentation](https://docs.nestjs.com/)
