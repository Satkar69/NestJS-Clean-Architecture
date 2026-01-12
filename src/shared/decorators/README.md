# Custom Decorators

This directory contains custom TypeScript decorators for enhancing classes, methods, and properties.

## Use Case

Custom decorators are used for:

- Adding metadata to classes/methods
- Creating reusable authentication/authorization logic
- Implementing cross-cutting concerns
- Simplifying controller code
- Custom validation

## Guidelines

- **Reusable**: Design for reuse across the application
- **Clear Purpose**: Each decorator should have a single, clear purpose
- **Well-Documented**: Document decorator parameters and behavior
- **Type Safe**: Use TypeScript types for decorator parameters

## Example - Roles Decorator

```typescript
// roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for a route
 * @param roles - Array of role names required to access the route
 *
 * @example
 * @Roles('admin', 'moderator')
 * @Get('/admin-panel')
 * getAdminPanel() { }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

## Example - Current User Decorator

```typescript
// current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract current user from request
 * Assumes user was attached to request by auth guard/middleware
 *
 * @example
 * @Get('/profile')
 * getProfile(@CurrentUser() user: User) {
 *   return user;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If a specific property is requested, return that
    return data ? user?.[data] : user;
  },
);

// Usage:
// @CurrentUser() user: User - Get entire user object
// @CurrentUser('id') userId: string - Get just the user ID
```

## Example - Public Route Decorator

```typescript
// public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as public (bypasses authentication)
 * Use with global auth guards
 *
 * @example
 * @Public()
 * @Post('/login')
 * login() { }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

## Example - API Response Decorator

```typescript
// api-response.decorator.ts
import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiCreatedResponse,
  getSchemaPath,
} from '@nestjs/swagger';

/**
 * Combined decorator for standardized API responses
 *
 * @example
 * @ApiSuccessResponse(UserDto)
 * @Get('/users')
 * getUsers() { }
 */
export const ApiSuccessResponse = <TModel extends Type<any>>(
  model: TModel,
  isArray = false,
) => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          {
            properties: {
              data: isArray
                ? { type: 'array', items: { $ref: getSchemaPath(model) } }
                : { $ref: getSchemaPath(model) },
              statusCode: { type: 'number', example: 200 },
              timestamp: {
                type: 'string',
                example: '2024-01-01T00:00:00.000Z',
              },
            },
          },
        ],
      },
    }),
  );
};

export const ApiCreateResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiCreatedResponse({
      schema: {
        properties: {
          data: { $ref: getSchemaPath(model) },
          statusCode: { type: 'number', example: 201 },
        },
      },
    }),
  );
};
```

## Example - Retry Decorator

```typescript
// retry.decorator.ts
/**
 * Decorator to retry a method on failure
 *
 * @param attempts - Number of retry attempts
 * @param delay - Delay between retries in milliseconds
 *
 * @example
 * @Retry(3, 1000)
 * async fetchData() { }
 */
export function Retry(attempts: number = 3, delay: number = 1000) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          if (attempt === attempts) {
            throw error;
          }
          console.log(`Retry attempt ${attempt}/${attempts} after ${delay}ms`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    };

    return descriptor;
  };
}
```

## Example - Validate Decorator

```typescript
// validate.decorator.ts
import { BadRequestException } from '@nestjs/common';

/**
 * Decorator to validate method parameters
 *
 * @example
 * @Validate((id: string) => id.length > 0, 'ID cannot be empty')
 * findById(id: string) { }
 */
export function Validate(
  validationFn: (...args: any[]) => boolean,
  errorMessage: string,
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      if (!validationFn(...args)) {
        throw new BadRequestException(errorMessage);
      }
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
```

## Example - Cache Decorator

```typescript
// cache.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY = 'cache';
export const CACHE_TTL_KEY = 'cache_ttl';

/**
 * Decorator to enable caching for a route
 *
 * @param ttl - Time to live in seconds
 *
 * @example
 * @Cache(300) // Cache for 5 minutes
 * @Get('/users')
 * getUsers() { }
 */
export const Cache = (ttl: number = 60) => {
  return applyDecorators(
    SetMetadata(CACHE_KEY, true),
    SetMetadata(CACHE_TTL_KEY, ttl),
  );
};

function applyDecorators(...decorators: any[]) {
  return (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) => {
    for (const decorator of decorators) {
      if (propertyKey && descriptor) {
        decorator(target, propertyKey, descriptor);
      } else {
        decorator(target);
      }
    }
  };
}
```

## Example - Audit Log Decorator

```typescript
// audit-log.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const AUDIT_LOG_KEY = 'auditLog';

export interface AuditLogMetadata {
  action: string;
  resource: string;
}

/**
 * Decorator to mark methods that should be audit logged
 *
 * @example
 * @AuditLog({ action: 'CREATE', resource: 'USER' })
 * @Post('/users')
 * createUser() { }
 */
export const AuditLog = (metadata: AuditLogMetadata) =>
  SetMetadata(AUDIT_LOG_KEY, metadata);
```

## Usage in Controller

```typescript
// user.controller.ts
import { Controller, Get, Post, UseGuards, Body } from '@nestjs/common';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { Public } from '../../shared/decorators/public.decorator';
import { Cache } from '../../shared/decorators/cache.decorator';
import { AuditLog } from '../../shared/decorators/audit-log.decorator';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UserController {
  @Public()
  @Post('/register')
  register(@Body() dto: CreateUserDto) {
    // Public route, no auth required
    return this.userService.create(dto);
  }

  @Get('/profile')
  @Cache(300) // Cache for 5 minutes
  getProfile(@CurrentUser() user: User) {
    return user;
  }

  @Roles('admin')
  @Get('/admin/users')
  @AuditLog({ action: 'LIST', resource: 'USERS' })
  getAllUsers(@CurrentUser('id') userId: string) {
    // Only admin can access
    return this.userService.findAll();
  }

  @Roles('admin', 'moderator')
  @Delete('/:id')
  @AuditLog({ action: 'DELETE', resource: 'USER' })
  deleteUser(@Param('id') id: string, @CurrentUser() user: User) {
    return this.userService.delete(id);
  }
}
```

## Common Decorator Types

- **Route Decorators**: @Public(), @Roles(), @RateLimit()
- **Parameter Decorators**: @CurrentUser(), @ClientIp(), @RequestId()
- **Method Decorators**: @Cache(), @Retry(), @Timeout()
- **Property Decorators**: @InjectRepository(), @InjectService()
- **Class Decorators**: @Controller(), @Injectable(), @Module()
