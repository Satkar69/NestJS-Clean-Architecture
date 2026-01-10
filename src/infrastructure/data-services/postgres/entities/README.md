# Persistence Entities

This directory contains ORM-specific entity definitions (TypeORM, Mongoose schemas, etc.).

## Guidelines

- **Framework Specific**: Use ORM decorators and annotations
- **Separate from Domain**: These are NOT domain entities
- **Mapping Required**: Always map to/from domain entities in repositories

## Example

```typescript
// user.entity.ts (TypeORM)
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```
