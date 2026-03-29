import { Module } from '@nestjs/common';
import { UserUseCaseService } from '@/src/core/application/use-cases/user/user-use-case.service';
import { GoogleStrategyService } from './google/google-strategy.service';
import { BcryptServiceModule } from '../../bcrypt/bcrypt.module';
import { DataServicesModule } from '@/src/infrastructure/data-services/data-services.module';
import { UserUseCaseFactory } from '@/src/core/application/use-cases/user/user-use-case-factory';
import { JwtTokenModule } from '../jwt-token/jwt-token.module';

@Module({
  imports: [BcryptServiceModule, DataServicesModule, JwtTokenModule],
  providers: [UserUseCaseFactory, UserUseCaseService, GoogleStrategyService],
  exports: [GoogleStrategyService],
})
export class PassportStrategyModule {}
