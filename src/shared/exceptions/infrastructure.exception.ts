import { BaseException } from './base.exception';

/**
 * Infrastructure Exception
 * Base class for infrastructure-related errors
 */
export abstract class InfrastructureException extends BaseException {
  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
  }
}

/**
 * Database Exception
 */
export class DatabaseException extends InfrastructureException {
  constructor(
    operation: string,
    message: string,
    context?: Record<string, any>,
  ) {
    super(`Database operation '${operation}' failed: ${message}`, {
      operation,
      ...context,
    });
  }
}

/**
 * Database Connection Exception
 */
export class DatabaseConnectionException extends InfrastructureException {
  constructor(
    database: string,
    message?: string,
    context?: Record<string, any>,
  ) {
    super(
      `Failed to connect to database '${database}': ${message || 'Connection error'}`,
      { database, ...context },
    );
  }
}

/**
 * Transaction Exception
 */
export class TransactionException extends InfrastructureException {
  constructor(
    operation: string,
    message: string,
    context?: Record<string, any>,
  ) {
    super(`Transaction failed during '${operation}': ${message}`, {
      operation,
      ...context,
    });
  }
}

/**
 * External Service Exception
 */
export class ExternalServiceException extends InfrastructureException {
  constructor(
    serviceName: string,
    operation: string,
    message: string,
    context?: Record<string, any>,
  ) {
    super(
      `External service '${serviceName}' failed on '${operation}': ${message}`,
      { serviceName, operation, ...context },
    );
  }
}

/**
 * Cache Exception
 */
export class CacheException extends InfrastructureException {
  constructor(
    operation: string,
    key: string,
    message?: string,
    context?: Record<string, any>,
  ) {
    super(
      `Cache operation '${operation}' failed for key '${key}': ${message || 'Unknown error'}`,
      { operation, key, ...context },
    );
  }
}

/**
 * File System Exception
 */
export class FileSystemException extends InfrastructureException {
  constructor(
    operation: string,
    path: string,
    message?: string,
    context?: Record<string, any>,
  ) {
    super(
      `File system operation '${operation}' failed for '${path}': ${message || 'Unknown error'}`,
      { operation, path, ...context },
    );
  }
}

/**
 * Message Queue Exception
 */
export class MessageQueueException extends InfrastructureException {
  constructor(
    queue: string,
    operation: string,
    message: string,
    context?: Record<string, any>,
  ) {
    super(`Message queue '${queue}' failed on '${operation}': ${message}`, {
      queue,
      operation,
      ...context,
    });
  }
}
