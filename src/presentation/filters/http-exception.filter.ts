import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  BaseException,
  DomainException,
  EntityNotFoundException,
  EntityAlreadyExistsException,
  BusinessRuleViolationException,
  InvalidOperationException,
  ValidationException,
  FieldValidationException,
  RequiredFieldException,
  InvalidFormatException,
  InfrastructureException,
  DatabaseException,
  DatabaseConnectionException,
  ExternalServiceException,
  HttpException as CustomHttpException,
  AuthenticationException,
  InvalidCredentialsException,
  TokenExpiredException,
  InvalidTokenException,
  AuthorizationException,
  InsufficientPermissionsException,
  ApplicationException,
  ConfigurationException,
  TimeoutException,
  RateLimitExceededException,
} from '../../shared/exceptions';

/**
 * Global HTTP Exception Filter
 * Handles all exceptions and formats responses based on environment
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  private readonly isDevelopment = process.env.NODE_ENV !== 'production';

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determine status code and error response
    const errorResponse = this.buildErrorResponse(exception, request);

    // Log the error
    this.logError(exception, request, errorResponse.statusCode);

    // Send response
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  /**
   * Build error response based on exception type
   */
  private buildErrorResponse(exception: unknown, request: Request): any {
    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;

    // Handle NestJS built-in HttpException
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, timestamp, path, method);
    }

    // Handle custom exceptions
    if (exception instanceof BaseException) {
      return this.handleCustomException(exception, timestamp, path, method);
    }

    // Handle unknown errors
    return this.handleUnknownError(exception, timestamp, path, method);
  }

  /**
   * Handle NestJS HttpException
   */
  private handleHttpException(
    exception: HttpException,
    timestamp: string,
    path: string,
    method: string,
  ): any {
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const baseResponse = {
      statusCode: status,
      timestamp,
      path,
      method,
      message:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || 'Internal server error',
    };

    // Add detailed info in development
    if (this.isDevelopment) {
      return {
        ...baseResponse,
        error: exception.name,
        details:
          typeof exceptionResponse === 'object' ? exceptionResponse : null,
        stack: exception.stack,
      };
    }

    return baseResponse;
  }

  /**
   * Handle custom exceptions
   */
  private handleCustomException(
    exception: BaseException,
    timestamp: string,
    path: string,
    method: string,
  ): any {
    const statusCode = this.mapExceptionToStatusCode(exception);

    const baseResponse = {
      statusCode,
      timestamp,
      path,
      method,
      error: exception.name,
      message: exception.message,
    };

    // Add context in development
    if (this.isDevelopment) {
      return {
        ...baseResponse,
        context: exception.context,
        stack: exception.stack,
        // Special handling for ValidationException
        ...(exception instanceof ValidationException && {
          validationErrors: exception.errors,
        }),
      };
    }

    // Production response - hide sensitive details
    const productionResponse: any = {
      ...baseResponse,
    };

    // Include specific fields for certain exception types
    if (exception instanceof ValidationException) {
      productionResponse.validationErrors = exception.errors;
    }

    if (exception instanceof RateLimitExceededException) {
      const retryAfter = exception.context?.retryAfter;
      if (retryAfter) {
        productionResponse.retryAfter = retryAfter;
      }
    }

    if (exception instanceof TokenExpiredException) {
      productionResponse.tokenType = exception.context?.tokenType;
    }

    return productionResponse;
  }

  /**
   * Handle unknown errors
   */
  private handleUnknownError(
    exception: unknown,
    timestamp: string,
    path: string,
    method: string,
  ): any {
    const message =
      exception instanceof Error
        ? exception.message
        : 'An unexpected error occurred';

    const baseResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp,
      path,
      method,
      error: 'InternalServerError',
      message: this.isDevelopment
        ? message
        : 'Internal server error. Please try again later.',
    };

    if (this.isDevelopment && exception instanceof Error) {
      return {
        ...baseResponse,
        stack: exception.stack,
        details: exception,
      };
    }

    return baseResponse;
  }

  /**
   * Map custom exceptions to HTTP status codes
   */
  private mapExceptionToStatusCode(exception: BaseException): number {
    // Check if it's already a CustomHttpException with statusCode
    if (exception instanceof CustomHttpException) {
      return exception.statusCode;
    }

    // Domain Exceptions
    if (exception instanceof EntityNotFoundException) {
      return HttpStatus.NOT_FOUND;
    }
    if (exception instanceof EntityAlreadyExistsException) {
      return HttpStatus.CONFLICT;
    }
    if (
      exception instanceof BusinessRuleViolationException ||
      exception instanceof InvalidOperationException
    ) {
      return HttpStatus.BAD_REQUEST;
    }

    // Validation Exceptions
    if (
      exception instanceof ValidationException ||
      exception instanceof FieldValidationException ||
      exception instanceof RequiredFieldException ||
      exception instanceof InvalidFormatException
    ) {
      return HttpStatus.BAD_REQUEST;
    }

    // Authentication Exceptions
    if (
      exception instanceof InvalidCredentialsException ||
      exception instanceof TokenExpiredException ||
      exception instanceof InvalidTokenException
    ) {
      return HttpStatus.UNAUTHORIZED;
    }

    // Authorization Exceptions
    if (exception instanceof InsufficientPermissionsException) {
      return HttpStatus.FORBIDDEN;
    }

    // Infrastructure Exceptions
    if (
      exception instanceof DatabaseException ||
      exception instanceof DatabaseConnectionException
    ) {
      return HttpStatus.SERVICE_UNAVAILABLE;
    }

    if (exception instanceof ExternalServiceException) {
      return HttpStatus.BAD_GATEWAY;
    }

    // Application Exceptions
    if (exception instanceof TimeoutException) {
      return HttpStatus.REQUEST_TIMEOUT;
    }

    if (exception instanceof RateLimitExceededException) {
      return HttpStatus.TOO_MANY_REQUESTS;
    }

    if (exception instanceof ConfigurationException) {
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    // Generic mapping based on exception type
    if (exception instanceof DomainException) {
      return HttpStatus.BAD_REQUEST;
    }
    if (exception instanceof InfrastructureException) {
      return HttpStatus.SERVICE_UNAVAILABLE;
    }
    if (exception instanceof AuthenticationException) {
      return HttpStatus.UNAUTHORIZED;
    }
    if (exception instanceof AuthorizationException) {
      return HttpStatus.FORBIDDEN;
    }
    if (exception instanceof ApplicationException) {
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    // Default
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  /**
   * Determine if a request should be ignored from logging
   * Filters out common browser/dev tools automated requests
   */
  private shouldIgnoreRequest(url: string, statusCode: number): boolean {
    // Only filter 404 errors (not other error types)
    if (statusCode !== HttpStatus.NOT_FOUND) {
      return false;
    }

    // List of URL patterns to ignore
    const ignorePatterns = [
      '/.well-known/', // Well-known URIs (devtools, security.txt, etc.)
      '/favicon.ico', // Favicon requests
      '/robots.txt', // Robots file
      '/sitemap.xml', // Sitemap
      '/__webpack_hmr', // Webpack HMR
      '/_next/', // Next.js routes
      '/sw.js', // Service worker
      '/manifest.json', // PWA manifest
      '/apple-touch-icon', // iOS icons
      '/browserconfig.xml', // Windows tile config
    ];

    return ignorePatterns.some((pattern) => url.includes(pattern));
  }

  /**
   * Log error with appropriate level
   */
  private logError(exception: unknown, request: Request, statusCode: number) {
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';

    // Ignore common noise from browser/dev tools automated requests
    if (this.shouldIgnoreRequest(url, statusCode)) {
      return;
    }

    const logContext = {
      method,
      url,
      ip,
      userAgent,
      statusCode,
    };

    // Build detailed error message
    const errorName =
      exception instanceof Error ? exception.name : 'UnknownError';
    const errorMessage =
      exception instanceof Error ? exception.message : String(exception);

    // Log based on severity
    if (statusCode >= 500) {
      // Server errors - log as error with full details
      this.logger.error(
        `[${errorName}] ${method} ${url} - ${statusCode}\nMessage: ${errorMessage}\nContext: ${JSON.stringify(logContext, null, 2)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else if (statusCode >= 400) {
      // Client errors - log as warning with stack trace
      this.logger.warn(
        `[${errorName}] ${method} ${url} - ${statusCode}\nMessage: ${errorMessage}\nContext: ${JSON.stringify(logContext, null, 2)}`,
      );

      // Log stack trace for client errors in development
      if (this.isDevelopment && exception instanceof Error && exception.stack) {
        this.logger.warn(`Stack Trace:\n${exception.stack}`);
      }
    }

    // Always log BaseException context in development
    if (this.isDevelopment && exception instanceof BaseException) {
      if (exception.context) {
        this.logger.debug(
          `Exception Context: ${JSON.stringify(exception.context, null, 2)}`,
        );
      }

      // Log validation errors if present
      if (exception instanceof ValidationException && exception.errors) {
        this.logger.debug(
          `Validation Errors: ${JSON.stringify(exception.errors, null, 2)}`,
        );
      }
    }
  }
}
