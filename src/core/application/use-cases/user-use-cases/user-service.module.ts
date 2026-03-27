import { Module } from '@nestjs/common';
import { DataServicesModule } from '@/src/infrastructure/data-services/data-services.module';
import { BcryptServiceModule } from '@/src/infrastructure/services/bcrypt/bcrypt.module';
import { UserFactoryService } from './user-factory.service';
import { UserService } from './user.service';
import { AuthModule } from '@/src/infrastructure/services/auth/auth.module';
@Module({
  imports: [DataServicesModule, BcryptServiceModule, AuthModule],
  providers: [UserService, UserFactoryService],
  exports: [UserService],
})
export class UserServiceModule {}
