# Interceptors

This directory contains interceptors that add cross-cutting logic to request/response handling.

## Use Case

Interceptors are used to:

- Transform response data
- Add logging and timing
- Handle caching
- Transform exceptions
- Add extra logic before/after method execution

## Guidelines

- **Single Responsibility**: Each interceptor should do one thing
- **Observable-based**: Work with RxJS observables
- **Non-intrusive**: Should not change business logic
- **Chainable**: Can apply multiple interceptors

## Example

```typescript
// transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map((data) => ({
        data,
        statusCode: context.switchToHttp().getResponse().statusCode,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }
}
```

## Logging Interceptor

```typescript
// logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    this.logger.log(`Incoming Request: ${method} ${url}`);

    return next.handle().pipe(
      tap({
        next: () => {
          const responseTime = Date.now() - now;
          this.logger.log(`Completed: ${method} ${url} - ${responseTime}ms`);
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `Failed: ${method} ${url} - ${responseTime}ms - ${error.message}`,
          );
        },
      }),
    );
  }
}
```

## Timeout Interceptor

```typescript
// timeout.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(5000), // 5 seconds timeout
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      }),
    );
  }
}
```

## Cache Interceptor

```typescript
// cache.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private cache = new Map<string, any>();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = `${request.method}:${request.url}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      return of(this.cache.get(cacheKey));
    }

    // Execute and cache result
    return next.handle().pipe(
      tap((response) => {
        this.cache.set(cacheKey, response);
        // Clear cache after 1 minute
        setTimeout(() => this.cache.delete(cacheKey), 60000);
      }),
    );
  }
}
```

## Usage

### Controller Level

```typescript
@Controller('users')
@UseInterceptors(LoggingInterceptor)
export class UserController {
  // ...
}
```

### Method Level

```typescript
@Get()
@UseInterceptors(TransformInterceptor, CacheInterceptor)
getUsers() {
  // ...
}
```

### Global Level

```typescript
// main.ts
app.useGlobalInterceptors(new LoggingInterceptor());
```

### Module Level

```typescript
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
```

## Order of Execution

1. Guards
2. Interceptors (before)
3. Pipes
4. Controller method
5. Interceptors (after)
6. Filters
