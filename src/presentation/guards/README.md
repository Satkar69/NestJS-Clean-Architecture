# Guards

This directory contains authentication and authorization guards.

## Use Case

Guards are used to:

- Protect routes that require authentication
- Check user permissions/roles before executing handlers
- Validate JWT tokens
- Implement authorization logic

## Guidelines

- **Single Responsibility**: Each guard should check one thing
- **Return boolean or throw**: Return true to allow, false/throw to deny
- **Inject dependencies**: Can inject services for auth checks
- **ExecutionContext**: Access request, response, and handler metadata

## Example

```typescript
// auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      // Attach user to request
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

## Role-Based Guard Example

```typescript
// roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../shared/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // No roles required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found in request');
    }

    const hasRole = requiredRoles.some((role) => user.roles?.includes(role));

    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
```

## Usage in Controller

```typescript
// user.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UserController {
  @Get('profile')
  getProfile() {
    return { message: 'Protected route - user authenticated' };
  }

  @Get('admin')
  @Roles('admin')
  getAdminData() {
    return { message: 'Admin only route' };
  }
}
```

## Global Guard

```typescript
// main.ts
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthGuard } from './presentation/guards/auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply guard globally
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new AuthGuard(reflector));

  await app.listen(3000);
}
```

## Common Guard Types

- **AuthGuard**: JWT/Session authentication
- **RolesGuard**: Role-based authorization
- **ThrottleGuard**: Rate limiting
- **ApiKeyGuard**: API key validation
- **OwnershipGuard**: Resource ownership verification
