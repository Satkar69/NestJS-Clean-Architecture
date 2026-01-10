# Custom Exceptions

This directory contains custom exception classes used across the application.

## Guidelines

- **Domain Exceptions**: Create specific exceptions for business rule violations
- **Clear Messages**: Provide meaningful error messages
- **HTTP Agnostic**: Don't couple to HTTP status codes in domain exceptions

## Example

```typescript
// domain-exception.ts
export abstract class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// user-not-found.exception.ts
export class UserNotFoundException extends DomainException {
  constructor(identifier: string) {
    super(`User not found: ${identifier}`);
  }
}
```
