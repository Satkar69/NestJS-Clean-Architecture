import { BaseException } from './base.exception';

/**
 * Authentication Exception
 * Base class for authentication-related errors
 */
export abstract class AuthenticationException extends BaseException {
  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
  }
}

/**
 * Invalid Credentials Exception
 */
export class InvalidCredentialsException extends AuthenticationException {
  constructor(
    message: string = 'Invalid credentials provided',
    context?: Record<string, any>,
  ) {
    super(message, context);
  }
}

/**
 * Token Expired Exception
 */
export class TokenExpiredException extends AuthenticationException {
  constructor(
    tokenType: string = 'access token',
    context?: Record<string, any>,
  ) {
    super(`${tokenType} has expired`, { tokenType, ...context });
  }
}

/**
 * Invalid Token Exception
 */
export class InvalidTokenException extends AuthenticationException {
  constructor(
    tokenType: string = 'token',
    reason?: string,
    context?: Record<string, any>,
  ) {
    super(`Invalid ${tokenType}${reason ? `: ${reason}` : ''}`, {
      tokenType,
      reason,
      ...context,
    });
  }
}

/**
 * Token Not Found Exception
 */
export class TokenNotFoundException extends AuthenticationException {
  constructor(tokenType: string = 'token', context?: Record<string, any>) {
    super(`${tokenType} not found in request`, { tokenType, ...context });
  }
}

/**
 * Authorization Exception
 * Base class for authorization-related errors
 */
export abstract class AuthorizationException extends BaseException {
  constructor(message: string, context?: Record<string, any>) {
    super(message, context);
  }
}

/**
 * Insufficient Permissions Exception
 */
export class InsufficientPermissionsException extends AuthorizationException {
  constructor(
    requiredPermissions: string[],
    resource?: string,
    context?: Record<string, any>,
  ) {
    super(
      `Insufficient permissions${resource ? ` to access ${resource}` : ''}. Required: ${requiredPermissions.join(', ')}`,
      { requiredPermissions, resource, ...context },
    );
  }
}

/**
 * Role Not Allowed Exception
 */
export class RoleNotAllowedException extends AuthorizationException {
  constructor(
    requiredRoles: string[],
    userRole?: string,
    context?: Record<string, any>,
  ) {
    super(
      `Access denied. Required roles: ${requiredRoles.join(', ')}${userRole ? `. Current role: ${userRole}` : ''}`,
      { requiredRoles, userRole, ...context },
    );
  }
}

/**
 * Resource Access Denied Exception
 */
export class ResourceAccessDeniedException extends AuthorizationException {
  constructor(
    resource: string,
    action: string,
    reason?: string,
    context?: Record<string, any>,
  ) {
    super(
      `Access denied to ${action} ${resource}${reason ? `: ${reason}` : ''}`,
      { resource, action, reason, ...context },
    );
  }
}

/**
 * Account Locked Exception
 */
export class AccountLockedException extends AuthenticationException {
  constructor(
    reason?: string,
    unlockTime?: Date,
    context?: Record<string, any>,
  ) {
    super(
      `Account is locked${reason ? `: ${reason}` : ''}${unlockTime ? `. Try again after ${unlockTime.toISOString()}` : ''}`,
      { reason, unlockTime, ...context },
    );
  }
}

/**
 * Account Disabled Exception
 */
export class AccountDisabledException extends AuthenticationException {
  constructor(reason?: string, context?: Record<string, any>) {
    super(`Account is disabled${reason ? `: ${reason}` : ''}`, {
      reason,
      ...context,
    });
  }
}

/**
 * Session Expired Exception
 */
export class SessionExpiredException extends AuthenticationException {
  constructor(
    message: string = 'Session has expired',
    context?: Record<string, any>,
  ) {
    super(message, context);
  }
}
