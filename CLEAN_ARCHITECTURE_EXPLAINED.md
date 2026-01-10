# Clean Architecture Layers - Explained

Based on Uncle Bob's Clean Architecture diagram, here's how each layer maps to your codebase:

---

## 1. 🎯 CORE LAYER (Innermost Circles)

### In the Diagram:

- **Yellow Circle**: "Entities" - Enterprise Business Rules
- **Pink/Red Circle**: "Use Cases" - Application Business Rules

### In Your Codebase:

```
src/core/
├── domain/                    # ← ENTITIES (Yellow Circle)
│   ├── entities/              # Core business objects
│   ├── value-objects/         # Immutable domain values
│   └── events/                # Domain events
│
└── application/               # ← USE CASES (Pink Circle)
    ├── use-cases/             # Application business logic
    ├── dto/                   # Data transfer objects
    └── ports/                 # Interfaces/contracts
        ├── in/                # Input ports (how use cases are called)
        └── out/               # Output ports (what use cases need)
```

### Purpose:

- **Entities**: Pure business logic with no dependencies
- **Use Cases**: Orchestrate the flow of data between entities and external systems
- **No Framework Dependencies**: Can be tested and used anywhere

### Example Flow:

```typescript
// 1. Entity (Yellow - Enterprise Rules)
export class User {
  constructor(
    private readonly id: string,
    private email: string,
  ) {}

  updateEmail(newEmail: string): void {
    // Pure business validation
    if (!this.isValidEmail(newEmail)) {
      throw new Error('Invalid email');
    }
    this.email = newEmail;
  }
}

// 2. Use Case (Pink - Application Rules)
@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    // Application logic: orchestrate entities and infrastructure
    const user = new User(uuid(), dto.email);
    return await this.userRepository.save(user);
  }
}
```

---

## 2. 🏗️ INFRASTRUCTURE LAYER (Outermost Blue Circle)

### In the Diagram:

- **Blue Circle**: "Frameworks & Drivers"
- Contains: DB, Devices, Web, UI, External Interfaces

### In Your Codebase:

```
src/infrastructure/
├── persistence/               # ← DATABASE (DB in diagram)
│   ├── repositories/          # Repository implementations
│   └── entities/              # ORM/Database entities (TypeORM, Prisma)
│
├── external-services/         # ← EXTERNAL INTERFACES
│   ├── email services         # SendGrid, AWS SES
│   ├── payment services       # Stripe, PayPal
│   └── storage services       # AWS S3, Google Cloud
│
└── config/                    # ← FRAMEWORK CONFIGURATION
    └── Configuration files
```

### Purpose:

- **Implements Output Ports**: Concrete implementations of interfaces defined in `core/application/ports/out`
- **External Dependencies**: Database, APIs, file systems, frameworks
- **Replaceable**: Can swap implementations without changing core logic

### Example:

```typescript
// Output Port (defined in core/application/ports/out)
export interface UserRepositoryPort {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
}

// Infrastructure Implementation (TypeORM)
@Injectable()
export class TypeOrmUserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async save(user: User): Promise<User> {
    // Convert domain entity to ORM entity
    const entity = this.toEntity(user);
    await this.repository.save(entity);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  // Mapping methods to separate concerns
  private toDomain(entity: UserEntity): User {
    return new User(entity.id, entity.email);
  }

  private toEntity(domain: User): UserEntity {
    const entity = new UserEntity();
    entity.id = domain.getId();
    entity.email = domain.getEmail();
    return entity;
  }
}
```

---

## 3. 🎨 PRESENTATION LAYER (Green Circle)

### In the Diagram:

- **Green Circle**: "Interface Adapters"
- Contains: Controllers, Gateways, Presenters
- Shows flow: **Controller → Use Case Input Port → Use Case Interactor → Use Case Output Port → Presenter**

### In Your Codebase:

```
src/presentation/
├── controllers/               # ← CONTROLLERS (entry point)
├── guards/                    # Authentication/Authorization
├── filters/                   # Exception handling
├── interceptors/              # Request/Response transformation
├── pipes/                     # Validation & transformation
└── middlewares/               # Pre-processing logic
```

### Purpose:

- **Controllers**: Convert HTTP requests into use case calls
- **Presenters**: Format use case output for HTTP responses
- **Adapters**: Bridge between HTTP/REST and application core

### Example Flow:

```typescript
// Controller (Green - Interface Adapter)
@Controller('users')
export class UserController {
  constructor(
    @Inject(CREATE_USER_USE_CASE)
    private readonly createUserUseCase: CreateUserInputPort,
  ) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    // 1. Controller receives HTTP request
    // 2. Validates with pipes
    // 3. Calls Use Case via Input Port
    const user = await this.createUserUseCase.execute(dto);

    // 4. Presents response (format domain entity for HTTP)
    return {
      id: user.getId(),
      email: user.getEmail(),
      createdAt: new Date().toISOString(),
    };
  }
}
```

### Data Flow (as shown in diagram):

```
HTTP Request → Controller (Green)
              ↓
           Input Port (Interface)
              ↓
        Use Case Interactor (Pink)
              ↓
           Output Port (Interface)
              ↓
           Presenter (Green)
              ↓
        HTTP Response
```

---

## 4. 🔧 SHARED LAYER (Cross-Cutting)

### Not Shown Explicitly in Diagram:

This layer provides utilities used across all other layers.

### In Your Codebase:

```
src/shared/
├── constants/                 # Application-wide constants
├── utils/                     # Utility functions
├── exceptions/                # Custom exception classes
└── decorators/                # Custom TypeScript decorators
```

### Purpose:

- **No Business Logic**: Only generic, reusable code
- **No Dependencies**: Should not depend on other layers
- **Framework Agnostic**: Can be used in any layer

### Example:

```typescript
// Shared utilities - no business logic
export class StringUtils {
  static toSlug(text: string): string {
    return text.toLowerCase().replace(/\s+/g, '-');
  }
}

// Custom decorators for presentation layer
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// Domain exceptions for core layer
export class UserNotFoundException extends DomainException {
  constructor(userId: string) {
    super(`User not found: ${userId}`);
  }
}
```

---

## 🔄 THE DEPENDENCY RULE (Critical!)

### As Shown in Diagram:

**Arrows point INWARD** - Dependencies can only point toward the center!

### Rule:

```
✅ Presentation → Application → Domain (ALLOWED)
✅ Infrastructure → Application → Domain (ALLOWED)
❌ Domain → Infrastructure (FORBIDDEN!)
❌ Application → Presentation (FORBIDDEN!)
```

### How We Enforce This:

#### 1. **Dependency Inversion Principle**

```typescript
// ❌ WRONG: Use Case depends on concrete implementation
import { TypeOrmUserRepository } from '../../infrastructure/...';

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: TypeOrmUserRepository, // ← Bad!
  ) {}
}

// ✅ CORRECT: Use Case depends on interface (port)
import { UserRepositoryPort } from '../ports/out/user.repository.port';

export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort, // ← Good!
  ) {}
}
```

#### 2. **Ports & Adapters Pattern**

```typescript
// Step 1: Core defines what it needs (Port/Interface)
// Location: src/core/application/ports/out/user.repository.port.ts
export interface UserRepositoryPort {
  save(user: User): Promise<User>;
}
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

// Step 2: Infrastructure implements the port
// Location: src/infrastructure/persistence/repositories/typeorm-user.repository.ts
@Injectable()
export class TypeOrmUserRepository implements UserRepositoryPort {
  async save(user: User): Promise<User> {
    // Implementation details
  }
}

// Step 3: Wire them together in module (Dependency Injection)
@Module({
  providers: [
    {
      provide: USER_REPOSITORY, // ← Symbol from core
      useClass: TypeOrmUserRepository, // ← Implementation from infrastructure
    },
  ],
})
export class UserModule {}
```

---

## 📊 Complete Request Flow Example

### User Registration Flow:

```
1. HTTP POST /users
   ↓
2. [PRESENTATION] UserController.create()
   │ - Validates DTO with pipes
   │ - Applies guards (auth)
   │ - Applies interceptors
   ↓
3. [APPLICATION] CreateUserUseCase.execute()
   │ - Business validation
   │ - Creates User entity (domain)
   │ - Calls repository via port
   ↓
4. [INFRASTRUCTURE] TypeOrmUserRepository.save()
   │ - Converts domain entity to ORM entity
   │ - Saves to database
   │ - Converts back to domain entity
   ↓
5. [APPLICATION] Returns User entity
   ↓
6. [PRESENTATION] Controller formats response
   ↓
7. HTTP Response 201 Created
```

### In Code:

```typescript
// 1. Request arrives at controller
@Controller('users')
export class UserController {
  @Post()
  async create(@Body() dto: CreateUserDto) {
    // 2. Call use case
    const user = await this.createUserUseCase.execute(dto);

    // 6. Format response
    return {
      id: user.getId(),
      email: user.getEmail(),
    };
  }
}

// 3. Use case orchestrates
@Injectable()
export class CreateUserUseCase {
  async execute(dto: CreateUserDto): Promise<User> {
    // Create domain entity
    const user = new User(uuid(), dto.email);

    // Call infrastructure via port
    return await this.userRepository.save(user);
  }
}

// 4. Infrastructure handles persistence
@Injectable()
export class TypeOrmUserRepository implements UserRepositoryPort {
  async save(user: User): Promise<User> {
    const entity = this.toEntity(user);
    await this.repository.save(entity);
    return user;
  }
}
```

---

## 🎯 Benefits of This Architecture

### 1. **Testability**

```typescript
// Test use case without database
describe('CreateUserUseCase', () => {
  it('should create user', async () => {
    const mockRepo: UserRepositoryPort = {
      save: jest.fn().mockResolvedValue(user),
    };

    const useCase = new CreateUserUseCase(mockRepo);
    const result = await useCase.execute(dto);

    expect(mockRepo.save).toHaveBeenCalled();
  });
});
```

### 2. **Flexibility**

```typescript
// Switch from TypeORM to Prisma without changing use cases
@Module({
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository, // ← Just swap implementation!
    },
  ],
})
```

### 3. **Maintainability**

- Each layer has clear responsibilities
- Changes in one layer don't affect others
- Easy to locate where logic belongs

### 4. **Framework Independence**

- Core business logic has zero framework dependencies
- Can migrate from NestJS to Express without rewriting business logic

---

## 📁 Your Current Structure Mapped to Diagram

```
Clean Architecture Diagram          Your Codebase
═══════════════════════════════════════════════════════════

┌─────────────────────────────┐
│  Frameworks & Drivers (Blue) │  → src/infrastructure/
│  - DB                        │     ├── persistence/
│  - External Interfaces       │     ├── external-services/
│  - Web/UI                    │     └── config/
└─────────────────────────────┘
         ↓ depends on
┌─────────────────────────────┐
│  Interface Adapters (Green)  │  → src/presentation/
│  - Controllers               │     ├── controllers/
│  - Gateways                  │     ├── guards/
│  - Presenters                │     ├── filters/
└─────────────────────────────┘     └── interceptors/
         ↓ depends on
┌─────────────────────────────┐
│  Use Cases (Pink)            │  → src/core/application/
│  - Application Rules         │     ├── use-cases/
│  - Ports (Interfaces)        │     ├── dto/
│                              │     └── ports/
└─────────────────────────────┘
         ↓ depends on
┌─────────────────────────────┐
│  Entities (Yellow)           │  → src/core/domain/
│  - Enterprise Rules          │     ├── entities/
│  - Value Objects             │     ├── value-objects/
│  - Domain Events             │     └── events/
└─────────────────────────────┘

Cross-cutting:                    → src/shared/
- Constants, Utils, Decorators       ├── constants/
                                     ├── utils/
                                     ├── exceptions/
                                     └── decorators/
```

---

## ✅ Key Takeaways

1. **Core Layer**: Pure business logic, no dependencies
2. **Infrastructure Layer**: Implements ports, handles external systems
3. **Presentation Layer**: HTTP/API concerns, converts requests to use case calls
4. **Shared Layer**: Generic utilities used everywhere
5. **Dependency Rule**: Always point inward, never outward
6. **Ports & Adapters**: Interfaces define contracts, implementations are injected
7. **Testability**: Mock ports to test use cases in isolation
8. **Flexibility**: Swap implementations without touching business logic

Your codebase is now perfectly structured to follow Uncle Bob's Clean Architecture principles! 🎉
