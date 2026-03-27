import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';
import {
  validate,
  ValidationError as ClassValidatorError,
} from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ValidationErrorInterface } from '@/src/shared/interface/validation-error.interface';
import { ValidationException } from '@/src/shared/exceptions';
@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    // destructuring metadata
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // Handle empty body
    if (
      !value ||
      (typeof value === 'object' && Object.keys(value).length === 0)
    ) {
      throw new ValidationException([], 'Request body cannot be empty');
    }

    const object = plainToClass(metatype, value, {
      excludeExtraneousValues: false,
    });

    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    });

    if (errors.length > 0) {
      const validationErrors = this.formatErrors(errors);
      throw new ValidationException(validationErrors, 'Validation failed');
    }

    return object;
  }

  private toValidate(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(
    errors: ClassValidatorError[],
  ): ValidationErrorInterface[] {
    const validationErrors: ValidationErrorInterface[] = [];

    for (const error of errors) {
      if (error.constraints) {
        validationErrors.push({
          field: error.property,
          message: Object.values(error.constraints).join(', '),
          value: error.value,
          constraints: error.constraints,
        });
      }

      // Handle nested validation errors
      if (error.children && error.children.length > 0) {
        const nestedErrors = this.formatErrors(error.children);
        nestedErrors.forEach((nestedError) => {
          validationErrors.push({
            ...nestedError,
            field: `${error.property}.${nestedError.field}`,
          });
        });
      }
    }

    return validationErrors;
  }
}
