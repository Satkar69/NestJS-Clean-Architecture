# Value Objects

This directory contains immutable value objects that represent domain concepts.

## Guidelines

- **Immutable**: Once created, their values cannot change
- **Self-validating**: Validate their own data in the constructor
- **No Identity**: Compared by their values, not by identity

## Example

```typescript
// email.value-object.ts
export class Email {
  private readonly value: string;

  constructor(email: string) {
    this.validate(email);
    this.value = email.toLowerCase();
  }

  private validate(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
```
