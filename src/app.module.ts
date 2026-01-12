import { Module } from '@nestjs/common';
import { DataServicesModule } from './infrastructure/data-services/data-services.module';
import { ConfigModule } from '@nestjs/config';
import { ClsStoreModule } from './infrastructure/services/cls-store/cls-store.module';
import { JwtTokenModule } from './infrastructure/services/jwt-token/jwt-token.module';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import routes from './presentation/controllers/routes';
import { ControllerModule } from './presentation/controllers/controller.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpLoggingInterceptor } from './presentation/interceptors/http-logging.interceptor';
import { ResponseInterceptor } from './presentation/interceptors/response.interceptor';
import { HttpExceptionFilter } from './presentation/filters';
import { AuthGuard } from './presentation/guards/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    JwtTokenModule,
    ClsStoreModule,
    DataServicesModule,
    RouterModule.register(routes),
    ControllerModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
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
