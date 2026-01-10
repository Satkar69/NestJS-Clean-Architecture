# Use Cases

This directory contains the application's business logic and orchestrates the flow between entities and external services.

## Guidelines

- **Single Responsibility**: Each use case should do one thing well
- **Dependency Injection**: Depend on ports (interfaces), not implementations
- **Application Logic**: Orchestrates domain entities and calls infrastructure through ports

## Example

```typescript
// create-user.use-case.ts
import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import {
  UserRepositoryPort,
  USER_REPOSITORY,
} from '../ports/out/user.repository.port';
import { CreateUserDto } from '../dto/create-user.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    // Business validation
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create domain entity
    const user = new User(this.generateId(), dto.email, dto.name);

    // Persist through port
    return await this.userRepository.save(user);
  }

  private generateId(): string {
    return `user-${Date.now()}-${Math.random()}`;
  }
}
```
