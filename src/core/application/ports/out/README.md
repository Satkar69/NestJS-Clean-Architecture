# Output Ports

This directory contains interfaces that define contracts for external services and repositories.
These are implemented in the infrastructure layer.

## Guidelines

- **Dependency Inversion**: Application depends on abstractions, not concretions
- **Framework Independent**: No framework-specific code here
- **Single Responsibility**: Each port should have a single, well-defined purpose

## Example

```typescript
// user.repository.port.ts
import { User } from '../../../domain/entities/user.entity';

export interface UserRepositoryPort {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  delete(id: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
```
