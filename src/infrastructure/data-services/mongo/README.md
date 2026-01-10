# Persistence Entities

This directory contains ORM-specific entity definitions (TypeORM, Mongoose schemas, etc.).

## Guidelines

- **Framework Specific**: Use ORM decorators and annotations
- **Separate from Domain**: These are NOT domain entities
- **Mapping Required**: Always map to/from domain entities in repositories
