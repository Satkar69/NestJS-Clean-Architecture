# Input Ports

This directory contains interfaces that define how external actors (like controllers) interact with use cases.

## Use Case

Input ports (also called "driving ports") define:

- The contract for use case execution
- What operations are available to the presentation layer
- How controllers should call business logic
- Clear API boundaries for your application

## Guidelines

- **Interface-based**: Always define as TypeScript interfaces
- **Use Case Per Port**: One interface per use case or logical grouping
- **Framework Independent**: No NestJS/framework-specific code
- **Command Pattern**: Often follow command/query pattern

## Example

```typescript
// create-user.input-port.ts
import { User } from '../../../domain/entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

export interface CreateUserInputPort {
  execute(dto: CreateUserDto): Promise<User>;
}

export const CREATE_USER_USE_CASE = Symbol('CREATE_USER_USE_CASE');
```

```typescript
// get-user.input-port.ts
import { User } from '../../../domain/entities/user.entity';

export interface GetUserInputPort {
  execute(userId: string): Promise<User>;
}

export const GET_USER_USE_CASE = Symbol('GET_USER_USE_CASE');
```

## Implementation in Use Case

```typescript
// create-user.use-case.ts (in use-cases directory)
import { Injectable, Inject } from '@nestjs/common';
import { CreateUserInputPort } from '../ports/in/create-user.input-port';
import {
  UserRepositoryPort,
  USER_REPOSITORY,
} from '../ports/out/user.repository.port';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class CreateUserUseCase implements CreateUserInputPort {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(dto.email);

    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = new User(this.generateId(), dto.email, dto.name);
    return await this.userRepository.save(user);
  }

  private generateId(): string {
    return `user-${Date.now()}-${Math.random()}`;
  }
}
```

## Usage in Controller

```typescript
// user.controller.ts
import { Controller, Post, Body, Inject } from '@nestjs/common';
import {
  CreateUserInputPort,
  CREATE_USER_USE_CASE,
} from '../../core/application/ports/in/create-user.input-port';
import { CreateUserDto } from '../../core/application/dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(
    @Inject(CREATE_USER_USE_CASE)
    private readonly createUserUseCase: CreateUserInputPort,
  ) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const user = await this.createUserUseCase.execute(dto);
    return {
      id: user.getId(),
      email: user.getEmail(),
      name: user.getName(),
    };
  }
}
```

## Module Registration

```typescript
// user.module.ts
import { Module } from '@nestjs/common';
import { CREATE_USER_USE_CASE } from './core/application/ports/in/create-user.input-port';
import { CreateUserUseCase } from './core/application/use-cases/create-user.use-case';

@Module({
  providers: [
    {
      provide: CREATE_USER_USE_CASE,
      useClass: CreateUserUseCase,
    },
  ],
  exports: [CREATE_USER_USE_CASE],
})
export class UserModule {}
```

## Benefits

- **Testability**: Easy to mock in controller tests
- **Flexibility**: Swap implementations without changing controllers
- **Documentation**: Clear contract of what the use case does
- **Type Safety**: TypeScript ensures correct usage
- **Separation**: Controllers don't depend on concrete use case classes

## Common Patterns

### Command Pattern

```typescript
export interface CreateUserInputPort {
  execute(command: CreateUserCommand): Promise<User>;
}
```

### Query Pattern

```typescript
export interface GetUsersInputPort {
  execute(query: GetUsersQuery): Promise<User[]>;
}
```

### CQRS Pattern

```typescript
// Commands modify state
export interface CreateUserCommand {}

// Queries read state
export interface GetUserQuery {}
```
