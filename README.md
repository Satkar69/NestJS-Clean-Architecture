# Clean Architecture Project Structure

This project follows **Clean Architecture** principles with the **Dependency Rule**: dependencies point inward, never outward.

## 📐 Architecture Overview

![Uncle Bob's Clean Architecture Diagram - Concentric circles showing Entities at center, then Use Cases, Interface Adapters, and Frameworks & Drivers at the outer layer](https://blog.cleancoder.com/uncle-bob/images/2012-08-13-the-clean-architecture/CleanArchitecture.jpg)

Based on Uncle Bob's Clean Architecture, our codebase is organized in concentric layers where each layer has specific responsibilities and dependency constraints.

```
┌─────────────────────────────────────────────┐
│      🌐 Frameworks & Drivers (Blue)         │
│     Infrastructure Layer                     │
├─────────────────────────────────────────────┤
│      🎨 Interface Adapters (Green)          │
│     Presentation Layer                       │
├─────────────────────────────────────────────┤
│      💼 Application Business Rules (Pink)   │
│     Application Layer                        │
├─────────────────────────────────────────────┤
│      🎯 Enterprise Business Rules (Yellow)  │
│     Domain Layer                             │
└─────────────────────────────────────────────┘
```

## 📁 Project Structure

```
src/
├── core/                          # Core business logic (innermost layers)
│   ├── domain/                    # 🎯 ENTITIES (Yellow Circle)
│   │   ├── entities/              # Enterprise business rules
│   │   ├── value-objects/         # Immutable value objects
│   │   └── events/                # Domain events
│   │
│   └── application/               # 💼 USE CASES (Pink Circle)
│       ├── use-cases/             # Application business logic
│       ├── dto/                   # Data Transfer Objects
│       └── ports/                 # Interfaces/Contracts
│           ├── in/                # Input ports (use case interfaces)
│           └── out/               # Output ports (repository, services)
│
├── infrastructure/                # 🌐 FRAMEWORKS & DRIVERS (Blue Circle)
│   ├── persistence/               # Database implementations
│   │   ├── repositories/          # Repository implementations
│   │   └── entities/              # ORM entities (TypeORM, Prisma, etc.)
│   ├── external-services/         # Third-party API integrations
│   └── config/                    # Configuration files
│
├── presentation/                  # 🎨 INTERFACE ADAPTERS (Green Circle)
│   ├── controllers/               # REST/GraphQL controllers
│   ├── guards/                    # Authentication/authorization
│   ├── filters/                   # Exception handling
│   ├── interceptors/              # Request/response transformation
│   ├── pipes/                     # Validation & transformation
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

```
✅ ALLOWED:
   Presentation → Application → Domain
   Infrastructure → Application → Domain

❌ FORBIDDEN:
   Domain → Application
   Domain → Infrastructure
   Application → Infrastructure
   Application → Presentation
```

### Visual Dependency Flow

```
Outer layers can depend on inner layers
         ↓
Infrastructure  →  Application  →  Domain
Presentation    →  Application  →  Domain
         ↓
Inner layers NEVER depend on outer layers
```

## 📦 Layer Responsibilities

### 🎯 Layer 1: Core/Domain (Entities - Yellow Circle)

**The innermost layer with ZERO external dependencies**

**Purpose**: Enterprise-wide business rules that are independent of any application

**Contains**:

- Pure business entities
- Value objects
- Domain events
- Business validation logic

**Rules**:

- Pure TypeScript/JavaScript only
- No framework dependencies
- No database concerns
- No HTTP concerns
- No infrastructure imports

**Example**:

```typescript
// user.entity.ts
export class User {
  constructor(
    private readonly id: string,
    private email: string,
    private readonly createdAt: Date,
  ) {}

  updateEmail(newEmail: string): void {
    if (!this.isValidEmail(newEmail)) {
      throw new Error('Invalid email format');
    }
    this.email = newEmail;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getEmail(): string {
    return this.email;
  }
}
```

---

### 💼 Layer 2: Core/Application (Use Cases - Pink Circle)

**Depends only on Domain layer**

**Purpose**: Application-specific business rules and orchestration

**Contains**:

- Use cases (application services)
- Data Transfer Objects (DTOs)
- Port interfaces (contracts for infrastructure)
- Application-level validation

**Rules**:

- Orchestrates domain entities
- Defines interfaces that infrastructure implements
- Framework independent
- No direct infrastructure imports

**Example**:

```typescript
// ports/out/user.repository.port.ts
export interface UserRepositoryPort {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

// use-cases/create-user.use-case.ts
@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort, // ← Interface, not implementation!
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create domain entity
    const user = new User(this.generateId(), dto.email, new Date());

    // Persist using port
    return await this.userRepository.save(user);
  }

  private generateId(): string {
    return uuid();
  }
}
```

---

### 🏗️ Layer 3: Infrastructure (Frameworks & Drivers - Blue Circle)

**Implements Application layer interfaces**

**Purpose**: External concerns - databases, APIs, file systems, frameworks

**Contains**:

- Repository implementations
- ORM entities (TypeORM, Prisma)
- API clients
- Configuration files
- External service integrations

**Rules**:

- Implements ports from application layer
- Contains framework-specific code
- Handles all external communication
- Can be swapped without affecting core logic

**Example**:

```typescript
// persistence/entities/user.entity.ts (ORM Entity)
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// persistence/repositories/typeorm-user.repository.ts
@Injectable()
export class TypeOrmUserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async save(user: User): Promise<User> {
    const entity = this.toDatabaseEntity(user);
    await this.repository.save(entity);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomainEntity(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? this.toDomainEntity(entity) : null;
  }

  // Mapping methods to separate domain from infrastructure
  private toDomainEntity(entity: UserEntity): User {
    return new User(entity.id, entity.email, entity.createdAt);
  }

  private toDatabaseEntity(domain: User): UserEntity {
    const entity = new UserEntity();
    entity.id = domain.getId();
    entity.email = domain.getEmail();
    return entity;
  }
}
```

---

### 🎨 Layer 4: Presentation (Interface Adapters - Green Circle)

**Depends on Application layer**

**Purpose**: Handle HTTP requests/responses and adapt external input to use cases

**Contains**:

- Controllers
- Guards (authentication/authorization)
- Filters (exception handling)
- Interceptors (transformation)
- Pipes (validation)
- Middlewares

**Rules**:

- Thin layer - delegates to use cases
- Handles HTTP/API concerns only
- Transforms requests to DTOs
- Formats responses for clients

**Example**:

```typescript
// dto/create-user.dto.ts
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

// controllers/user.controller.ts
@Controller('users')
export class UserController {
  constructor(
    @Inject(CREATE_USER_USE_CASE)
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto) {
    // Delegate to use case
    const user = await this.createUserUseCase.execute(dto);

    // Format response for HTTP
    return {
      id: user.getId(),
      email: user.getEmail(),
      message: 'User created successfully',
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.getUserUseCase.execute(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.getId(),
      email: user.getEmail(),
    };
  }
}
```

---

### 🔧 Layer 5: Shared (Cross-Cutting Concerns)

**Can be used by any layer**

**Purpose**: Generic utilities and cross-cutting concerns

**Contains**:

- Application constants
- Utility functions
- Custom exceptions
- Decorators

**Rules**:

- No business logic
- Generic and reusable
- No layer-specific code
- Framework agnostic when possible

**Example**:

```typescript
// shared/exceptions/domain.exception.ts
export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UserNotFoundException extends DomainException {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`);
  }
}

// shared/utils/string.utils.ts
export class StringUtils {
  static toSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '');
  }

  static capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }
}

// shared/decorators/roles.decorator.ts
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

## 🔌 Dependency Injection Pattern (Ports & Adapters)

The key to maintaining the Dependency Rule is using **Dependency Inversion**:

### Step 1: Define Port (Interface) in Application Layer

```typescript
// src/core/application/ports/out/user.repository.port.ts
export interface UserRepositoryPort {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
```

### Step 2: Use Port in Use Case

```typescript
// src/core/application/use-cases/create-user.use-case.ts
@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) // ← Inject using symbol
    private readonly userRepository: UserRepositoryPort, // ← Depend on interface
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const user = new User(uuid(), dto.email, new Date());
    return await this.userRepository.save(user);
  }
}
```

### Step 3: Implement Port in Infrastructure

```typescript
// src/infrastructure/persistence/repositories/typeorm-user.repository.ts
@Injectable()
export class TypeOrmUserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async save(user: User): Promise<User> {
    // Implementation details
    const entity = this.toEntity(user);
    await this.repository.save(entity);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }
}
```

### Step 4: Wire Dependencies in Module

```typescript
// user.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [
    CreateUserUseCase,
    {
      provide: USER_REPOSITORY, // ← Symbol from application layer
      useClass: TypeOrmUserRepository, // ← Implementation from infrastructure
    },
  ],
})
export class UserModule {}
```

## 🔄 Complete Request Flow

Here's how a typical request flows through all layers:

```
1. HTTP POST /users
   ↓
2. [PRESENTATION] UserController.create()
   │ • Receives HTTP request
   │ • Validates DTO with pipes
   │ • Applies guards (authentication/authorization)
   │ • Applies interceptors
   ↓
3. [APPLICATION] CreateUserUseCase.execute()
   │ • Performs business validation
   │ • Creates domain entity
   │ • Orchestrates business logic
   │ • Calls repository via port interface
   ↓
4. [INFRASTRUCTURE] TypeOrmUserRepository.save()
   │ • Converts domain entity to ORM entity
   │ • Persists to database
   │ • Converts ORM entity back to domain entity
   │ • Returns domain entity
   ↓
5. [APPLICATION] Returns User entity
   ↓
6. [PRESENTATION] Controller formats response
   │ • Transforms domain entity to response DTO
   │ • Adds HTTP metadata
   ↓
7. HTTP Response 201 Created
```

### Flow in Code:

```typescript
// 1-2: Request arrives at controller
@Controller('users')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    // 3: Call use case
    const user = await this.createUserUseCase.execute(dto);

    // 6: Format response
    return {
      id: user.getId(),
      email: user.getEmail(),
      createdAt: user.getCreatedAt().toISOString(),
    };
  }
}

// 3: Use case orchestrates business logic
@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    // Business validation
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('User already exists');
    }

    // Create domain entity with business rules
    const user = new User(uuid(), dto.email, new Date());

    // 4: Persist via infrastructure
    return await this.userRepository.save(user);
  }
}

// 4: Infrastructure handles persistence
@Injectable()
export class TypeOrmUserRepository implements UserRepositoryPort {
  async save(user: User): Promise<User> {
    const entity = this.toDatabaseEntity(user);
    await this.repository.save(entity);
    return user; // Return domain entity
  }
}
```

## 🧪 Testing Strategy

### Unit Tests - Domain Layer

Test pure business logic in isolation:

```typescript
describe('User Entity', () => {
  it('should update email when valid', () => {
    const user = new User('123', 'old@example.com', new Date());

    user.updateEmail('new@example.com');

    expect(user.getEmail()).toBe('new@example.com');
  });

  it('should throw error for invalid email', () => {
    const user = new User('123', 'valid@example.com', new Date());

    expect(() => user.updateEmail('invalid-email')).toThrow(
      'Invalid email format',
    );
  });
});
```

### Unit Tests - Application Layer

Test use cases with mocked dependencies:

```typescript
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockRepository: jest.Mocked<UserRepositoryPort>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
    };

    useCase = new CreateUserUseCase(mockRepository);
  });

  it('should create user successfully', async () => {
    mockRepository.findByEmail.mockResolvedValue(null);
    mockRepository.save.mockImplementation((user) => Promise.resolve(user));

    const dto = { email: 'test@example.com' };
    const result = await useCase.execute(dto);

    expect(mockRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(mockRepository.save).toHaveBeenCalled();
    expect(result.getEmail()).toBe(dto.email);
  });

  it('should throw error if user already exists', async () => {
    const existingUser = new User('123', 'test@example.com', new Date());
    mockRepository.findByEmail.mockResolvedValue(existingUser);

    const dto = { email: 'test@example.com' };

    await expect(useCase.execute(dto)).rejects.toThrow('User already exists');
    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});
```

### Integration Tests - Infrastructure Layer

Test with actual database:

```typescript
describe('TypeOrmUserRepository', () => {
  let repository: TypeOrmUserRepository;
  let dataSource: DataSource;

  beforeAll(async () => {
    // Setup test database
    dataSource = await new DataSource({
      type: 'postgres',
      database: 'test_db',
      entities: [UserEntity],
      synchronize: true,
    }).initialize();

    repository = new TypeOrmUserRepository(
      dataSource.getRepository(UserEntity),
    );
  });

  it('should save and retrieve user', async () => {
    const user = new User(uuid(), 'test@example.com', new Date());

    await repository.save(user);
    const retrieved = await repository.findById(user.getId());

    expect(retrieved).toBeDefined();
    expect(retrieved?.getEmail()).toBe('test@example.com');
  });

  afterAll(async () => {
    await dataSource.destroy();
  });
});
```

### E2E Tests - Full Stack

Test complete user scenarios:

```typescript
describe('User API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users (POST) - should create user', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ email: 'test@example.com' })
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
        expect(res.body.email).toBe('test@example.com');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## ✅ Benefits of Clean Architecture

### 1. **Testability**

- Core business logic is isolated and easy to test
- Mock dependencies at boundaries
- Fast unit tests without databases or frameworks

### 2. **Maintainability**

- Clear separation of concerns
- Each layer has well-defined responsibilities
- Easy to locate and modify code

### 3. **Flexibility**

- Swap infrastructure without touching business logic
- Change frameworks without rewriting core
- Multiple adapters for same use case

### 4. **Scalability**

- Organized structure supports growth
- Easy to add new features
- Parallel development across layers

### 5. **Framework Independence**

- Core logic doesn't depend on NestJS
- Can migrate to different framework
- Business rules survive technology changes

### 6. **Database Independence**

- Easy to switch from TypeORM to Prisma
- Support multiple databases simultaneously
- Test with in-memory repositories

## 🚀 Getting Started Checklist

Follow this order when building new features:

### 1. **Define Domain Entity**

Location: `src/core/domain/entities/`

```typescript
export class Product {
  constructor(
    private readonly id: string,
    private name: string,
    private price: number,
  ) {}

  // Business logic here
}
```

### 2. **Create Value Objects** (if needed)

Location: `src/core/domain/value-objects/`

```typescript
export class Money {
  constructor(
    private readonly amount: number,
    private readonly currency: string,
  ) {
    if (amount < 0) throw new Error('Amount cannot be negative');
  }
}
```

### 3. **Define Output Ports**

Location: `src/core/application/ports/out/`

```typescript
export interface ProductRepositoryPort {
  save(product: Product): Promise<Product>;
  findById(id: string): Promise<Product | null>;
}
export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');
```

### 4. **Create DTOs**

Location: `src/core/application/dto/`

```typescript
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;
}
```

### 5. **Implement Use Cases**

Location: `src/core/application/use-cases/`

```typescript
@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly repository: ProductRepositoryPort,
  ) {}

  async execute(dto: CreateProductDto): Promise<Product> {
    const product = new Product(uuid(), dto.name, dto.price);
    return await this.repository.save(product);
  }
}
```

### 6. **Implement Repository**

Location: `src/infrastructure/persistence/repositories/`

```typescript
@Injectable()
export class TypeOrmProductRepository implements ProductRepositoryPort {
  // Implementation with ORM
}
```

### 7. **Create Controller**

Location: `src/presentation/controllers/`

```typescript
@Controller('products')
export class ProductController {
  constructor(private readonly createProductUseCase: CreateProductUseCase) {}

  @Post()
  async create(@Body() dto: CreateProductDto) {
    return await this.createProductUseCase.execute(dto);
  }
}
```

### 8. **Wire Dependencies in Module**

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  controllers: [ProductController],
  providers: [
    CreateProductUseCase,
    {
      provide: PRODUCT_REPOSITORY,
      useClass: TypeOrmProductRepository,
    },
  ],
})
export class ProductModule {}
```

## 🎓 Common Patterns

### Repository Pattern

```typescript
// Port (Interface)
export interface IRepository<T> {
  save(entity: T): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  update(id: string, entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

// Implementation
export class TypeOrmBaseRepository<T> implements IRepository<T> {
  // Generic repository implementation
}
```

### Use Case Pattern

```typescript
export interface IUseCase<Input, Output> {
  execute(input: Input): Promise<Output>;
}

export class CreateUserUseCase implements IUseCase<CreateUserDto, User> {
  async execute(input: CreateUserDto): Promise<User> {
    // Implementation
  }
}
```

### Factory Pattern

```typescript
// Domain
export class UserFactory {
  static create(dto: CreateUserDto): User {
    return new User(uuid(), dto.email, new Date());
  }

  static reconstitute(data: any): User {
    return new User(data.id, data.email, new Date(data.createdAt));
  }
}
```

## ⚠️ Common Mistakes to Avoid

### ❌ Don't: Import infrastructure in use cases

```typescript
// WRONG
import { TypeOrmUserRepository } from '../../infrastructure/...';

export class CreateUserUseCase {
  constructor(private readonly repository: TypeOrmUserRepository) {}
}
```

### ✅ Do: Depend on interfaces

```typescript
// CORRECT
import { UserRepositoryPort } from '../ports/out/user.repository.port';

export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly repository: UserRepositoryPort,
  ) {}
}
```

### ❌ Don't: Put business logic in controllers

```typescript
// WRONG
@Controller('users')
export class UserController {
  @Post()
  async create(@Body() dto: CreateUserDto) {
    // Business logic in controller - BAD!
    if (dto.email.includes('spam')) {
      throw new BadRequestException('Invalid email');
    }
    // ...
  }
}
```

### ✅ Do: Put business logic in domain/use cases

```typescript
// CORRECT
export class User {
  updateEmail(newEmail: string): void {
    if (this.isSpamEmail(newEmail)) {
      throw new Error('Invalid email');
    }
    this.email = newEmail;
  }
}
```

### ❌ Don't: Expose ORM entities directly

```typescript
// WRONG
@Controller('users')
export class UserController {
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserEntity> {
    return await this.repository.findOne(id); // Exposing TypeORM entity!
  }
}
```

### ✅ Do: Return domain entities or DTOs

```typescript
// CORRECT
@Controller('users')
export class UserController {
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.getUserUseCase.execute(id);
    return this.toResponseDto(user); // Return DTO
  }
}
```

## 📚 Additional Resources

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [The Clean Architecture (Book)](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Domain-Driven Design by Eric Evans](https://www.amazon.com/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215)
- [NestJS Documentation](https://docs.nestjs.com/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

## 🤝 Contributing

When contributing to this project:

1. Follow the layer structure strictly
2. Respect the Dependency Rule
3. Write tests for each layer
4. Document your code
5. Use meaningful names
6. Keep functions small and focused

## 📝 License

[Your License Here]

---

**Remember**: The goal is to create software that is independent of frameworks, testable, independent of UI, independent of databases, and independent of any external agency. Keep business logic pure and dependencies pointing inward!
