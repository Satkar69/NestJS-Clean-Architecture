import { BaseException } from './base.exception';
import { ValidationErrorInterface } from '../interface/error.interface';

/**
 * Validation Exception
 * Used for input validation errors
 */
export class ValidationException extends BaseException {
  public readonly errors: ValidationErrorInterface[];

  constructor(
    errors: ValidationErrorInterface[],
    message?: string,
    context?: Record<string, unknown>,
  ) {
    super(message || 'Validation failed', { errors, ...context });
    this.errors = errors;
  }
}
