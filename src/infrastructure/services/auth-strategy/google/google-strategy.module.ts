import { Module } from '@nestjs/common';
import { UserService } from 'src/core/application/use-cases/user-use-cases/user.service';
import { GoogleStrategyService } from './google-strategy.service';
import { BcryptServiceModule } from '../../bcrypt/bcrypt.module';
import { DataServicesModule } from 'src/infrastructure/data-services/data-services.module';
import { UserFactoryService } from 'src/core/application/use-cases/user-use-cases/user-factory.service';
import { JwtTokenModule } from '../jwt-token/jwt-token.module';

@Module({
  imports: [BcryptServiceModule, DataServicesModule, JwtTokenModule],
  providers: [UserFactoryService, UserService, GoogleStrategyService],
  exports: [GoogleStrategyService],
})
export class GoogleStrategyModule {}
