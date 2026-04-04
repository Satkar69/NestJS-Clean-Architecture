import { HttpException } from './http.exception';
import { FieldErrorInterface } from '../interface/error.interface';

export class AppException extends HttpException {
  public readonly errors?: FieldErrorInterface | FieldErrorInterface[];

  constructor(
    statusCode: number,
    message: string,
    errors?: FieldErrorInterface | FieldErrorInterface[],
    context?: Record<string, unknown>,
  ) {
    super(statusCode, message, context);
    this.errors = errors;
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      ...(this.errors !== undefined && { errors: this.errors }),
    };
  }
}
