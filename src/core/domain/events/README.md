# Domain Events

This directory contains domain events that represent important business occurrences in your application.

## Use Case

Domain events are used to:

- Decouple domain logic from side effects
- Enable event-driven architecture
- Track important business state changes
- Trigger actions in other parts of the system

## Guidelines

- **Immutable**: Events should be immutable once created
- **Past Tense**: Name events in past tense (UserCreated, OrderPlaced)
- **Rich Information**: Include all relevant data needed by event handlers
- **Domain Language**: Use business-meaningful names

## Example

```typescript
// user-created.event.ts
export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}

// Usage in Domain Entity
export class User {
  private events: UserCreatedEvent[] = [];

  constructor(
    private readonly id: string,
    private readonly email: string,
    private name: string,
  ) {
    // Raise domain event
    this.events.push(new UserCreatedEvent(id, email, name));
  }

  getEvents(): UserCreatedEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }
}

// Event Handler Example (in application layer)
@Injectable()
export class UserCreatedEventHandler {
  constructor(private readonly emailService: EmailService) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    await this.emailService.sendWelcomeEmail(event.email, event.name);
  }
}
```

## Common Event Types

- **UserCreatedEvent**: When a new user registers
- **OrderPlacedEvent**: When a customer places an order
- **PaymentProcessedEvent**: When a payment is completed
- **ProductInventoryChangedEvent**: When stock levels change
- **AccountActivatedEvent**: When an account is activated

## Integration with NestJS

```typescript
// Using NestJS EventEmitter
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const user = new User(uuid(), dto.email, dto.name);

    // Emit domain event
    const events = user.getEvents();
    events.forEach((event) => {
      this.eventEmitter.emit(event.constructor.name, event);
    });

    user.clearEvents();
    return user;
  }
}
```
