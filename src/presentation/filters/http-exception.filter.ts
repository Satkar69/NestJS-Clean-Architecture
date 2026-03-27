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
  AppException,
  BaseException,
  ValidationException,
} from '../../shared/exceptions';
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  private readonly isDevelopment = process.env.NODE_ENV !== 'production';

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);
    this.logError(exception, request, errorResponse.statusCode);
    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown, request: Request): any {
    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;

    // Handle AppException (generic application exception)
    if (exception instanceof AppException) {
      return this.handleAppException(exception, timestamp, path, method);
    }

    // Handle NestJS built-in HttpException
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception, timestamp, path, method);
    }

    // Handle other custom BaseExceptions (e.g. ValidationException)
    if (exception instanceof BaseException) {
      return this.handleBaseException(exception, timestamp, path, method);
    }

    // Handle unknown errors
    return this.handleUnknownError(exception, timestamp, path, method);
  }

  private handleAppException(
    exception: AppException,
    timestamp: string,
    path: string,
    method: string,
  ): any {
    const baseResponse = {
      statusCode: exception.statusCode,
      timestamp,
      path,
      method,
      error: exception.name,
      message: exception.message,
      ...(exception.errors && { errors: exception.errors }),
    };

    if (this.isDevelopment) {
      return {
        ...baseResponse,
        context: exception.context,
        stack: exception.stack,
      };
    }

    return baseResponse;
  }

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

  private handleBaseException(
    exception: BaseException,
    timestamp: string,
    path: string,
    method: string,
  ): any {
    const baseResponse = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp,
      path,
      method,
      error: exception.name,
      message: exception.message,
    };

    if (this.isDevelopment) {
      return {
        ...baseResponse,
        context: exception.context,
        stack: exception.stack,
        ...(exception instanceof ValidationException && {
          validationErrors: exception.errors,
        }),
      };
    }

    if (exception instanceof ValidationException) {
      return { ...baseResponse, validationErrors: exception.errors };
    }

    return baseResponse;
  }

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
      return { ...baseResponse, stack: exception.stack, details: exception };
    }

    return baseResponse;
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

  private logError(exception: unknown, request: Request, statusCode: number) {
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';

    if (this.shouldIgnoreRequest(url, statusCode)) return;

    const logContext = { method, url, ip, userAgent, statusCode };
    const errorName =
      exception instanceof Error ? exception.name : 'UnknownError';
    const errorMessage =
      exception instanceof Error ? exception.message : String(exception);

    if (statusCode >= 500) {
      this.logger.error(
        `[${errorName}] ${method} ${url} - ${statusCode}\nMessage: ${errorMessage}\nContext: ${JSON.stringify(logContext, null, 2)}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else if (statusCode >= 400) {
      this.logger.warn(
        `[${errorName}] ${method} ${url} - ${statusCode}\nMessage: ${errorMessage}\nContext: ${JSON.stringify(logContext, null, 2)}`,
      );

      if (this.isDevelopment && exception instanceof Error && exception.stack) {
        this.logger.warn(`Stack Trace:\n${exception.stack}`);
      }
    }

    if (this.isDevelopment && exception instanceof BaseException) {
      if (exception.context) {
        this.logger.debug(
          `Exception Context: ${JSON.stringify(exception.context, null, 2)}`,
        );
      }
      if (exception instanceof ValidationException && exception.errors) {
        this.logger.debug(
          `Validation Errors: ${JSON.stringify(exception.errors, null, 2)}`,
        );
      }
    }
  }
}
