import { BaseException } from './base.exception';

/**
 * HTTP Exception
 * Base class for HTTP-related exceptions
 */
export class HttpException extends BaseException {
  public readonly statusCode: number;

  constructor(
    statusCode: number,
    message: string,
    context?: Record<string, any>,
  ) {
    super(message, context);
    this.statusCode = statusCode;
  }
}
