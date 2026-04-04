export interface FieldErrorInterface {
  field: string;
  message: string;
}

export interface ValidationErrorInterface extends FieldErrorInterface {
  value?: any;
  constraints?: Record<string, string>;
}

export interface BaseErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  error: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
}

export interface AppErrorResponse extends BaseErrorResponse {
  errors?: FieldErrorInterface | FieldErrorInterface[];
}

export interface ValidationErrorResponse extends BaseErrorResponse {
  errors: ValidationErrorInterface[];
}

export interface DevDetails {
  stack?: string;
  context?: Record<string, any>;
}
