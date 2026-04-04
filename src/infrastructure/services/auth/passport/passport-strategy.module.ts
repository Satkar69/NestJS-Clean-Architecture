import { Module } from '@nestjs/common';
import { GoogleStrategyService } from './google/google-strategy.service';
import { BcryptServiceModule } from '../../bcrypt/bcrypt.module';
import { DataServicesModule } from '@/src/infrastructure/data-services/data-services.module';
import { AuthUseCaseFactory } from '@/src/core/application/use-cases/auth/auth-use-case-factory';
import { JwtTokenModule } from '../jwt-token/jwt-token.module';
import { AuthUseCaseService } from '@/src/core/application/use-cases/auth/auth-use-case.service';
import { AuthUseCaseHelper } from '@/src/core/application/use-cases/auth/auth-use-case.helper';
import { UserUseCaseModule } from '@/src/core/application/use-cases/user/user-use-case.module';

@Module({
  imports: [
    BcryptServiceModule,
    DataServicesModule,
    JwtTokenModule,
    UserUseCaseModule,
  ],
  providers: [
    AuthUseCaseHelper,
    AuthUseCaseFactory,
    AuthUseCaseService,
    GoogleStrategyService,
  ],
  exports: [GoogleStrategyService],
})
export class PassportStrategyModule {}
