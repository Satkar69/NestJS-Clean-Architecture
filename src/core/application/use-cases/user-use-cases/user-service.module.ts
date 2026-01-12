import { Module } from '@nestjs/common';
import { DataServicesModule } from 'src/infrastructure/data-services/data-services.module';
import { BcryptServiceModule } from 'src/infrastructure/services/bcrypt/bcrypt.module';
import { UserFactoryUseCaseService } from './user-factory.service';
import { UserService } from './user.service';

@Module({
  imports: [DataServicesModule, BcryptServiceModule],
  providers: [UserService, UserFactoryUseCaseService],
  exports: [UserService],
})
export class UserServiceModule {}
