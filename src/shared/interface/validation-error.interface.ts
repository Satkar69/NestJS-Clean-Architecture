export interface ValidationErrorInterface {
  field: string;
  message: string;
  value?: any;
  constraints?: Record<string, string>;
}
