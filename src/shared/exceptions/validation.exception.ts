import { BaseException } from './base.exception';
import { ValidationErrorInterface } from '../interface/validation-error.interface';

/**
 * Validation Exception
 * Used for input validation errors
 */
export class ValidationException extends BaseException {
  public readonly errors: ValidationErrorInterface[];

  constructor(
    errors: ValidationErrorInterface[],
    message?: string,
    context?: Record<string, any>,
  ) {
    super(message || 'Validation failed', { errors, ...context });
    this.errors = errors;
  }
}
