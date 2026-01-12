import { BaseException } from './base.exception';

/**
 * HTTP Exception
 * Base class for HTTP-related exceptions
 */
export abstract class HttpException extends BaseException {
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

/**
 * Bad Request Exception (400)
 */
export class BadRequestException extends HttpException {
  constructor(message: string = 'Bad Request', context?: Record<string, any>) {
    super(400, message, context);
  }
}

/**
 * Unauthorized Exception (401)
 */
export class UnauthorizedException extends HttpException {
  constructor(message: string = 'Unauthorized', context?: Record<string, any>) {
    super(401, message, context);
  }
}

/**
 * Forbidden Exception (403)
 */
export class ForbiddenException extends HttpException {
  constructor(message: string = 'Forbidden', context?: Record<string, any>) {
    super(403, message, context);
  }
}

/**
 * Not Found Exception (404)
 */
export class NotFoundException extends HttpException {
  constructor(
    resource: string,
    message?: string,
    context?: Record<string, any>,
  ) {
    super(404, message || `${resource} not found`, { resource, ...context });
  }
}

/**
 * Conflict Exception (409)
 */
export class ConflictException extends HttpException {
  constructor(message: string = 'Conflict', context?: Record<string, any>) {
    super(409, message, context);
  }
}

/**
 * Unprocessable Entity Exception (422)
 */
export class UnprocessableEntityException extends HttpException {
  constructor(
    message: string = 'Unprocessable Entity',
    context?: Record<string, any>,
  ) {
    super(422, message, context);
  }
}

/**
 * Too Many Requests Exception (429)
 */
export class TooManyRequestsException extends HttpException {
  constructor(
    message: string = 'Too Many Requests',
    retryAfter?: number,
    context?: Record<string, any>,
  ) {
    super(429, message, { retryAfter, ...context });
  }
}

/**
 * Internal Server Error Exception (500)
 */
export class InternalServerErrorException extends HttpException {
  constructor(
    message: string = 'Internal Server Error',
    context?: Record<string, any>,
  ) {
    super(500, message, context);
  }
}

/**
 * Service Unavailable Exception (503)
 */
export class ServiceUnavailableException extends HttpException {
  constructor(
    message: string = 'Service Unavailable',
    context?: Record<string, any>,
  ) {
    super(503, message, context);
  }
}

/**
 * Gateway Timeout Exception (504)
 */
export class GatewayTimeoutException extends HttpException {
  constructor(
    service: string,
    message?: string,
    context?: Record<string, any>,
  ) {
    super(504, message || `Gateway timeout while calling ${service}`, {
      service,
      ...context,
    });
  }
}
