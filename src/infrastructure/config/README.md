# Configuration

This directory contains application configuration files.

## Guidelines

- **Environment Variables**: Load from .env files
- **Type Safety**: Use validated configuration classes
- **Separation**: Separate concerns (database, auth, etc.)

## Example

```typescript
// database.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: process.env.DB_TYPE || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
}));
```
