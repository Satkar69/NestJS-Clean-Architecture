import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppResponse } from '@/src/shared/interface/response/app-response';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<AppResponse<unknown>> {
    const response = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      map((value: AppResponse<unknown>) => {
        if (value?.statusCode) {
          response.status(value.statusCode);
        }
        return value;
      }),
    );
  }
}
