# Middlewares

This directory contains middleware functions that execute before route handlers.

## Use Case

Middlewares are used to:

- Log requests
- Parse request bodies
- Handle CORS
- Add security headers
- Rate limiting
- Request ID tracking
- Session management

## Guidelines

- **Request/Response Access**: Can access and modify req/res objects
- **Call next()**: Must call next() to pass control
- **Order Matters**: Execution order is important
- **Apply Early**: Applied before guards, interceptors, pipes

## Example

```typescript
// logger.middleware.ts
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    this.logger.log(`${method} ${originalUrl} - ${ip} - ${userAgent}`);

    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;

      this.logger.log(
        `${method} ${originalUrl} ${statusCode} - ${responseTime}ms`,
      );
    });

    next();
  }
}
```

## Request ID Middleware

```typescript
// request-id.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = req.headers['x-request-id'] || uuidv4();

    // Add to request
    req['requestId'] = requestId;

    // Add to response headers
    res.setHeader('X-Request-Id', requestId);

    next();
  }
}
```

## Cors Middleware

```typescript
// cors.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    );

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }

    next();
  }
}
```

## Authentication Middleware

```typescript
// auth.middleware.ts
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = this.extractToken(req);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      req['user'] = payload;
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
```

## Rate Limiting Middleware

```typescript
// rate-limit.middleware.ts
import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private requests = new Map<string, number[]>();
  private readonly limit = 100; // requests
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  use(req: Request, res: Response, next: NextFunction) {
    const identifier = req.ip;
    const now = Date.now();

    // Get request timestamps for this IP
    let timestamps = this.requests.get(identifier) || [];

    // Remove old timestamps outside the window
    timestamps = timestamps.filter((time) => now - time < this.windowMs);

    if (timestamps.length >= this.limit) {
      throw new HttpException(
        'Too many requests, please try again later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Add current timestamp
    timestamps.push(now);
    this.requests.set(identifier, timestamps);

    next();
  }
}
```

## Registration in Module

```typescript
// app.module.ts
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './presentation/middlewares/logger.middleware';
import { RequestIdMiddleware } from './presentation/middlewares/request-id.middleware';
import { AuthMiddleware } from './presentation/middlewares/auth.middleware';

@Module({
  // ...
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply to all routes
    consumer.apply(RequestIdMiddleware, LoggerMiddleware).forRoutes('*');

    // Apply to specific routes
    consumer.apply(AuthMiddleware).forRoutes('users', 'admin');

    // Exclude specific routes
    consumer
      .apply(AuthMiddleware)
      .exclude('auth/login', 'auth/register')
      .forRoutes('*');
  }
}
```

## Functional Middleware

```typescript
// functional-logger.middleware.ts
import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`${req.method} ${req.url}`);
  next();
}

// In module
consumer.apply(logger).forRoutes('*');
```

## Execution Order

```
1. Middleware
2. Guards
3. Interceptors (before)
4. Pipes
5. Controller/Handler
6. Interceptors (after)
7. Exception Filters
```
