# Pipes

This directory contains validation and transformation pipes.

## Use Case

Pipes are used to:

- Validate input data
- Transform input data
- Parse request parameters
- Sanitize user input
- Convert types

## Guidelines

- **Transform or Validate**: Each pipe should either transform or validate
- **Throw on Error**: Throw BadRequestException for validation errors
- **Type Safety**: Leverage TypeScript types
- **Reusable**: Create generic, reusable pipes

## Example

```typescript
// validation.pipe.ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = errors.map((error) => ({
        field: error.property,
        errors: Object.values(error.constraints || {}),
      }));

      throw new BadRequestException({
        message: 'Validation failed',
        errors: messages,
      });
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

## Parse UUID Pipe

```typescript
// parse-uuid.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { validate as isUUID } from 'uuid';

@Injectable()
export class ParseUUIDPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!isUUID(value)) {
      throw new BadRequestException(`${value} is not a valid UUID`);
    }
    return value;
  }
}
```

## Trim Pipe

```typescript
// trim.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (typeof value === 'object' && value !== null) {
      return this.trimObject(value);
    }

    return value;
  }

  private trimObject(obj: any): any {
    const trimmed = {};
    for (const [key, val] of Object.entries(obj)) {
      trimmed[key] = typeof val === 'string' ? val.trim() : val;
    }
    return trimmed;
  }
}
```

## Default Value Pipe

```typescript
// default-value.pipe.ts
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class DefaultValuePipe implements PipeTransform {
  constructor(private readonly defaultValue: any) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (value === undefined || value === null) {
      return this.defaultValue;
    }
    return value;
  }
}
```

## File Validation Pipe

```typescript
// file-validation.pipe.ts
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(
    private readonly allowedTypes: string[],
    private readonly maxSize: number = 5 * 1024 * 1024, // 5MB
  ) {}

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!this.allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${this.allowedTypes.join(', ')}`,
      );
    }

    if (file.size > this.maxSize) {
      throw new BadRequestException(
        `File size exceeds ${this.maxSize / (1024 * 1024)}MB`,
      );
    }

    return file;
  }
}
```

## Usage

### Parameter Level

```typescript
@Get(':id')
findOne(@Param('id', ParseUUIDPipe) id: string) {
  return this.userService.findOne(id);
}
```

### Controller Level

```typescript
@Controller('users')
@UsePipes(ValidationPipe)
export class UserController {
  // ...
}
```

### Global Level

```typescript
// main.ts
import { ValidationPipe } from '@nestjs/common';

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

### With Custom Options

```typescript
@Post()
create(
  @Body(new ValidationPipe({ transform: true })) dto: CreateUserDto,
) {
  return this.userService.create(dto);
}
```

## Built-in NestJS Pipes

- **ParseIntPipe**: Parses string to integer
- **ParseBoolPipe**: Parses string to boolean
- **ParseArrayPipe**: Parses string to array
- **ParseUUIDPipe**: Validates UUID
- **ParseEnumPipe**: Validates enum values
- **DefaultValuePipe**: Sets default values
- **ValidationPipe**: Validates with class-validator
