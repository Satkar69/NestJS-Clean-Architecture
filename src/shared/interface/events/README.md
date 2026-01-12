# Events

This directory contains event-related interfaces and types for the NestJS application.

## Purpose

Define event interfaces and event handler contracts for implementing event-driven architecture patterns within the application.

## Structure

Events should be organized by domain or feature area:

```
events/
├── user.events.ts       # User-related events
├── auth.events.ts       # Authentication events
└── system.events.ts     # System-level events
```

## Usage

### Defining Events

```typescript
export interface UserCreatedEvent {
    userId: string;
    email: string;
    timestamp: Date;
}

export interface UserUpdatedEvent {
    userId: string;
    changes: Partial<User>;
    timestamp: Date;
}
```

### Event Handler Interface

```typescript
export interface IEventHandler<T> {
    handle(event: T): Promise<void>;
}
```

## Best Practices

- Use descriptive event names with past tense (e.g., `UserCreated`, `OrderPlaced`)
- Include timestamps in event payloads
- Keep events immutable
- Document event properties and their purpose
- Use type-safe event definitions
- Consider versioning for breaking changes

## Related

- Event emitters and listeners in `/src/shared/services/`
- Domain events in respective feature modules