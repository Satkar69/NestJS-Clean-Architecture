# Controllers

This directory contains HTTP controllers that handle incoming requests.

## Guidelines

- **Thin Layer**: Controllers should be thin, delegating to use cases
- **HTTP Concerns Only**: Handle request/response, validation, serialization
- **Dependency on Use Cases**: Inject and call use cases from application layer

## Example

```typescript
// user.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CreateUserUseCase } from '../../core/application/use-cases/create-user.use-case';
import { CreateUserDto } from '../../core/application/dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

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
