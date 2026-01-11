import { BaseException } from './base.exception';

/**
 * Validation Exception
 * Used for input validation errors
 */
export class ValidationException extends BaseException {
  public readonly errors: ValidationError[];

  constructor(
    errors: ValidationError[],
    message?: string,
    context?: Record<string, any>,
  ) {
    super(message || 'Validation failed', { errors, ...context });
    this.errors = errors;
  }
}

/**
 * Validation Error Interface
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  constraints?: Record<string, string>;
}

/**
 * Field Validation Exception
 */
export class FieldValidationException extends BaseException {
  constructor(
    field: string,
    message: string,
    value?: any,
    context?: Record<string, any>,
  ) {
    super(`Validation failed for field '${field}': ${message}`, {
      field,
      value,
      ...context,
    });
  }
}

/**
 * Required Field Exception
 */
export class RequiredFieldException extends BaseException {
  constructor(fieldName: string, context?: Record<string, any>) {
    super(`Required field '${fieldName}' is missing`, {
      field: fieldName,
      ...context,
    });
  }
}

/**
 * Invalid Format Exception
 */
export class InvalidFormatException extends BaseException {
  constructor(
    field: string,
    expectedFormat: string,
    actualValue?: any,
    context?: Record<string, any>,
  ) {
    super(`Invalid format for field '${field}'. Expected: ${expectedFormat}`, {
      field,
      expectedFormat,
      actualValue,
      ...context,
    });
  }
}

/**
 * Value Out of Range Exception
 */
export class ValueOutOfRangeException extends BaseException {
  constructor(
    field: string,
    min: number | string,
    max: number | string,
    actualValue: any,
    context?: Record<string, any>,
  ) {
    super(
      `Value for '${field}' is out of range. Expected: ${min} - ${max}, Got: ${actualValue}`,
      { field, min, max, actualValue, ...context },
    );
  }
}
