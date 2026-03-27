import { Module } from '@nestjs/common';
import { DataServicesModule } from '@/src/infrastructure/data-services/data-services.module';
import { BcryptServiceModule } from '@/src/infrastructure/services/bcrypt/bcrypt.module';
import { UserFactoryUseCaseService } from './user-use-case-factory.service';
import { UserUseCaseService } from './user-use-case.service';
import { AuthModule } from '@/src/infrastructure/services/auth/auth.module';
@Module({
  imports: [DataServicesModule, BcryptServiceModule, AuthModule],
  providers: [UserUseCaseService, UserFactoryUseCaseService],
  exports: [UserUseCaseService],
})
export class UserUseCaseServiceModule {}
