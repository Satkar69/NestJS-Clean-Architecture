import { Module } from '@nestjs/common';
import { AppController } from './presentation/controllers/app.controller';
import { AppService } from './core/application/use-cases/app.service';
import { DataServicesModule } from './infrastructure/data-services/data-services.module';
import { ConfigModule } from '@nestjs/config';
import { ClsStoreModule } from './infrastructure/services/cls-store/cls-store.module';
import { JwtTokenModule } from './infrastructure/services/jwt-token/jwt-token.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpLoggingInterceptor } from './presentation/interceptors/http-logging.interceptor';
import { ResponseInterceptor } from './presentation/interceptors/response.interceptor';
import { HttpExceptionFilter } from './presentation/filters';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    JwtTokenModule,
    ClsStoreModule,
    DataServicesModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
