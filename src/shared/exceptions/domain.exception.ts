import { BaseException } from './base.exception';

/**
 * Domain Exception
 * Used for business rule violations and domain-specific errors
 */
export abstract class DomainException extends BaseException {
  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
  }
}

/**
 * Entity Not Found Exception
 */
export class EntityNotFoundException extends DomainException {
  constructor(
    entityName: string,
    identifier: string | number,
    context?: Record<string, any>,
  ) {
    super(`${entityName} with identifier '${identifier}' not found`, {
      entityName,
      identifier,
      ...context,
    });
  }
}

/**
 * Entity Already Exists Exception
 */
export class EntityAlreadyExistsException extends DomainException {
  constructor(
    entityName: string,
    field: string,
    value: any,
    context?: Record<string, any>,
  ) {
    super(`${entityName} with ${field} '${value}' already exists`, {
      entityName,
      field,
      value,
      ...context,
    });
  }
}

/**
 * Business Rule Violation Exception
 */
export class BusinessRuleViolationException extends DomainException {
  constructor(rule: string, message: string, context?: Record<string, any>) {
    super(`Business rule violation: ${rule}. ${message}`, { rule, ...context });
  }
}

/**
 * Invalid Operation Exception
 */
export class InvalidOperationException extends DomainException {
  constructor(
    operation: string,
    reason: string,
    context?: Record<string, any>,
  ) {
    super(`Invalid operation '${operation}': ${reason}`, {
      operation,
      reason,
      ...context,
    });
  }
}

/**
 * Domain State Exception
 */
export class DomainStateException extends DomainException {
  constructor(
    entity: string,
    currentState: string,
    expectedState: string,
    context?: Record<string, any>,
  ) {
    super(
      `${entity} is in '${currentState}' state, expected '${expectedState}'`,
      { entity, currentState, expectedState, ...context },
    );
  }
}
