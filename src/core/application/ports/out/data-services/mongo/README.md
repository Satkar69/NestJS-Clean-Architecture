# MongoDB Data Services Abstractions

This directory contains abstract interfaces (ports) that define the contract for MongoDB data persistence operations in the Clean Architecture.

## Purpose

Following the Dependency Inversion Principle, these abstractions:

- Define the contract that MongoDB implementations must fulfill
- Are part of the **Application Layer** (Core)
- Allow the application to depend on abstractions, not concrete implementations
- Enable easy swapping of MongoDB implementations or migration to other databases

## Structure

### Key Files

- **`mongo-data-services.abstract.ts`** - Main MongoDB data services interface defining repository access and transaction handling
- **`mongo-generic-repository.abstract.ts`** - Generic repository interface for MongoDB CRUD operations

## Pattern

```typescript
// Abstract interface (this directory)
export abstract class IMongoDataServices {
  abstract user: IMongoGenericRepository<UserModel>;
  abstract handleTransaction<T>(
    operation: (session: ClientSession) => Promise<T>,
  ): Promise<T>;
}

// Concrete implementation (in infrastructure layer)
@Injectable()
export class MongoDataServices implements IMongoDataServices {
  user: MongoGenericRepository<UserModel>;

  async handleTransaction<T>(
    operation: (session: ClientSession) => Promise<T>,
  ): Promise<T> {
    // Actual MongoDB transaction logic
  }
}
```

## Guidelines

### For Application Layer (Use Cases)

```typescript
constructor(
  @Inject(MONGO_DATA_SERVICES)
  private dataServices: IMongoDataServices
) {}

async createUser(dto: CreateUserDto) {
  return this.dataServices.user.create(dto);
}
```

### For Infrastructure Layer

- Implement these abstractions in `src/infrastructure/data-services/mongo/`
- Use Mongoose or native MongoDB driver
- Handle connection management, sessions, and transactions
- Map between MongoDB documents and domain models

## Benefits

1. **Testability**: Easy to mock for unit tests
2. **Flexibility**: Swap implementations without changing business logic
3. **Independence**: Application logic doesn't depend on MongoDB specifics
4. **Clean Architecture**: Proper separation of concerns

## Related

- Implementation: [src/infrastructure/data-services/mongo](../../../../../infrastructure/data-services/mongo/README.md)
- PostgreSQL Abstractions: [../postgres](../postgres/pg-data-services.abstract.ts)
- Generic Repository Pattern: See individual repository abstractions
