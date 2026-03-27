import { Module } from '@nestjs/common';
import { UserUseCaseService } from '@/src/core/application/use-cases/user-use-cases/user-use-case.service';
import { GoogleStrategyService } from './google-strategy.service';
import { BcryptServiceModule } from '../../bcrypt/bcrypt.module';
import { DataServicesModule } from '@/src/infrastructure/data-services/data-services.module';
import { UserFactoryUseCaseService } from '@/src/core/application/use-cases/user-use-cases/user-use-case-factory.service';
import { JwtTokenModule } from '../jwt-token/jwt-token.module';

@Module({
  imports: [BcryptServiceModule, DataServicesModule, JwtTokenModule],
  providers: [
    UserFactoryUseCaseService,
    UserUseCaseService,
    GoogleStrategyService,
  ],
  exports: [GoogleStrategyService],
})
export class GoogleStrategyModule {}
