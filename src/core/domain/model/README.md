# Domain Entities

This directory contains the core business entities of your application.

## Guidelines

- **No Dependencies**: Entities should not depend on any external frameworks or libraries
- **Pure Business Logic**: Contains only essential business rules and data
- **Framework Independent**: Should be reusable in any context

## Example

```typescript
// user.entity.ts
export class User {
  constructor(
    private readonly id: string,
    private readonly email: string,
    private name: string,
  ) {}

  getId(): string {
    return this.id;
  }

  getEmail(): string {
    return this.email;
  }

  getName(): string {
    return this.name;
  }

  updateName(newName: string): void {
    if (!newName || newName.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }
    this.name = newName;
  }
}
```
