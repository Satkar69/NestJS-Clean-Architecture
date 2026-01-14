import { Module } from '@nestjs/common';
import { DataServicesModule } from 'src/infrastructure/data-services/data-services.module';
import { BcryptServiceModule } from 'src/infrastructure/services/bcrypt/bcrypt.module';
import { UserFactoryService } from './user-factory.service';
import { UserService } from './user.service';
import { AuthStrategyModule } from 'src/infrastructure/services/auth-strategy/auth-strategy.module';

@Module({
  imports: [DataServicesModule, BcryptServiceModule, AuthStrategyModule],
  providers: [UserService, UserFactoryService],
  exports: [UserService],
})
export class UserServiceModule {}
