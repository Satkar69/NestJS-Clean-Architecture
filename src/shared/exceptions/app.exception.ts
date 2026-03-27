import { HttpException } from './http.exception';

export class AppException extends HttpException {
  public readonly errors?: Record<string, any> | Record<string, any>[];

  constructor(
    statusCode: number,
    message: string,
    errors?: Record<string, any> | Record<string, any>[],
  ) {
    super(statusCode, message);
    this.errors = errors;
  }

  static create(
    statusCode: number,
    message: string,
    errors?: Record<string, any> | Record<string, any>[],
  ): AppException {
    return new AppException(statusCode, message, errors);
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      statusCode: this.statusCode,
      errors: this.errors,
    };
  }
}
