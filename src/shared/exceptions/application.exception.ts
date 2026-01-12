import { BaseException } from './base.exception';

/**
 * Application Exception
 * Base class for application-level errors
 */
export abstract class ApplicationException extends BaseException {
  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
  }
}

/**
 * Configuration Exception
 */
export class ConfigurationException extends ApplicationException {
  constructor(
    configKey: string,
    message: string,
    context?: Record<string, any>,
  ) {
    super(`Configuration error for '${configKey}': ${message}`, {
      configKey,
      ...context,
    });
  }
}

/**
 * Not Implemented Exception
 */
export class NotImplementedException extends ApplicationException {
  constructor(feature: string, context?: Record<string, any>) {
    super(`Feature '${feature}' is not implemented yet`, {
      feature,
      ...context,
    });
  }
}

/**
 * Timeout Exception
 */
export class TimeoutException extends ApplicationException {
  constructor(
    operation: string,
    timeoutMs: number,
    context?: Record<string, any>,
  ) {
    super(`Operation '${operation}' timed out after ${timeoutMs}ms`, {
      operation,
      timeoutMs,
      ...context,
    });
  }
}

/**
 * Resource Exhausted Exception
 */
export class ResourceExhaustedException extends ApplicationException {
  constructor(
    resource: string,
    limit: number | string,
    context?: Record<string, any>,
  ) {
    super(`Resource '${resource}' exhausted. Limit: ${limit}`, {
      resource,
      limit,
      ...context,
    });
  }
}

/**
 * Concurrency Exception
 */
export class ConcurrencyException extends ApplicationException {
  constructor(
    resource: string,
    message: string = 'Resource was modified by another process',
    context?: Record<string, any>,
  ) {
    super(`Concurrency conflict on '${resource}': ${message}`, {
      resource,
      ...context,
    });
  }
}

/**
 * Rate Limit Exceeded Exception
 */
export class RateLimitExceededException extends ApplicationException {
  constructor(
    identifier: string,
    limit: number,
    window: string,
    retryAfter?: number,
    context?: Record<string, any>,
  ) {
    super(
      `Rate limit exceeded for '${identifier}'. Limit: ${limit} requests per ${window}`,
      { identifier, limit, window, retryAfter, ...context },
    );
  }
}

/**
 * Circular Dependency Exception
 */
export class CircularDependencyException extends ApplicationException {
  constructor(entities: string[], context?: Record<string, any>) {
    super(`Circular dependency detected: ${entities.join(' -> ')}`, {
      entities,
      ...context,
    });
  }
}

/**
 * Feature Disabled Exception
 */
export class FeatureDisabledException extends ApplicationException {
  constructor(feature: string, reason?: string, context?: Record<string, any>) {
    super(
      `Feature '${feature}' is currently disabled${reason ? `: ${reason}` : ''}`,
      { feature, reason, ...context },
    );
  }
}
