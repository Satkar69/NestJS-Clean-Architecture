import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  AppException,
  BaseException,
  HttpException,
  ValidationException,
} from '../../shared/exceptions';
import {
  AppErrorResponse,
  BaseErrorResponse,
  ValidationErrorResponse,
} from '@/src/shared/interface/error.interface';

type ErrorResponse =
  | AppErrorResponse
  | ValidationErrorResponse
  | BaseErrorResponse;

interface RequestMeta {
  timestamp: string;
  path: string;
  method: string;
}

// ----------------------------------------------------------------
// Filter
// ----------------------------------------------------------------

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  private readonly isDev = process.env.NODE_ENV !== 'production';

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);

    if (!this.shouldIgnoreRequest(request.url, errorResponse.statusCode)) {
      this.logError(exception, request, errorResponse.statusCode);
    }

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  // ----------------------------------------------------------------
  // Response builders
  // ----------------------------------------------------------------

  private buildErrorResponse(
    exception: unknown,
    request: Request,
  ): ErrorResponse {
    const meta = this.buildMeta(request);

    if (exception instanceof AppException) {
      return this.handleAppException(exception, meta);
    }

    if (exception instanceof ValidationException) {
      return this.handleValidationException(exception, meta);
    }

    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, meta);
    }

    if (exception instanceof BaseException) {
      return this.handleBaseException(exception, meta);
    }

    return this.handleUnknownError(exception, meta);
  }

  private handleAppException(
    exception: AppException,
    meta: RequestMeta,
  ): AppErrorResponse {
    const base: AppErrorResponse = {
      ...meta,
      statusCode: exception.statusCode,
      error: exception.name,
      message: exception.message,
      ...(exception.errors !== undefined && { errors: exception.errors }),
    };

    return this.withDevDetails(base, exception);
  }

  private handleValidationException(
    exception: ValidationException,
    meta: RequestMeta,
  ): ValidationErrorResponse {
    const base: ValidationErrorResponse = {
      ...meta,
      statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      error: exception.name,
      message: exception.message,
      errors: exception.errors,
    };

    return this.withDevDetails(base, exception);
  }

  private handleHttpException(
    exception: HttpException,
    meta: RequestMeta,
  ): BaseErrorResponse {
    const base: BaseErrorResponse = {
      ...meta,
      statusCode: exception.statusCode,
      error: exception.name,
      message: exception.message,
    };

    return this.withDevDetails(base, exception);
  }

  private handleBaseException(
    exception: BaseException,
    meta: RequestMeta,
  ): BaseErrorResponse {
    const base: BaseErrorResponse = {
      ...meta,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: exception.name,
      message: exception.message,
    };

    return this.withDevDetails(base, exception);
  }

  private handleUnknownError(
    exception: unknown,
    meta: RequestMeta,
  ): BaseErrorResponse {
    const base: BaseErrorResponse = {
      ...meta,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'InternalServerError',
      message:
        this.isDev && exception instanceof Error
          ? exception.message
          : 'Internal server error. Please try again later.',
    };

    return this.isDev && exception instanceof Error
      ? { ...base, stack: exception.stack }
      : base;
  }

  // ----------------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------------

  private buildMeta(request: Request): RequestMeta {
    return {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };
  }

  private withDevDetails<T extends BaseErrorResponse>(
    base: T,
    exception: BaseException,
  ): T {
    if (!this.isDev) return base;

    return {
      ...base,
      stack: exception.stack,
      ...(exception.context && { context: exception.context }),
    };
  }

  private shouldIgnoreRequest(url: string, statusCode: number): boolean {
    if (statusCode !== HttpStatus.NOT_FOUND) return false;

    const ignorePatterns = [
      '/.well-known/',
      '/favicon.ico',
      '/robots.txt',
      '/sitemap.xml',
      '/__webpack_hmr',
      '/_next/',
      '/sw.js',
      '/manifest.json',
      '/apple-touch-icon',
      '/browserconfig.xml',
    ];

    return ignorePatterns.some((pattern) => url.includes(pattern));
  }

  // ----------------------------------------------------------------
  // Logging
  // ----------------------------------------------------------------

  private logError(
    exception: unknown,
    request: Request,
    statusCode: number,
  ): void {
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] ?? 'Unknown';
    const errorName =
      exception instanceof Error ? exception.name : 'UnknownError';
    const errorMessage =
      exception instanceof Error ? exception.message : String(exception);
    const logContext = { method, url, ip, userAgent, statusCode };

    if (statusCode >= 500) {
      this.logger.error(
        `[${errorName}] ${method} ${url} - ${statusCode}\nMessage: ${errorMessage}\nContext: ${JSON.stringify(logContext, null, 2)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
      return;
    }

    if (statusCode >= 400) {
      this.logger.warn(
        `[${errorName}] ${method} ${url} - ${statusCode}\nMessage: ${errorMessage}`,
      );

      if (this.isDev && exception instanceof Error) {
        this.logger.debug(`Stack:\n${exception.stack}`);
      }
    }

    if (this.isDev && exception instanceof BaseException) {
      if (exception.context) {
        this.logger.debug(
          `Exception Context: ${JSON.stringify(exception.context, null, 2)}`,
        );
      }

      if (exception instanceof ValidationException) {
        this.logger.debug(
          `Validation Errors: ${JSON.stringify(exception.errors, null, 2)}`,
        );
      }
    }
  }
}
