# Data Transfer Objects (DTOs)

This directory contains DTOs for transferring data between layers.

## Guidelines

- **Data Only**: No business logic
- **Validation**: Use class-validator decorators for input validation
- **Serialization**: Define how data is transferred

## Example

```typescript
// create-user.dto.ts
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(2)
  name: string;
}
```
