import { Module } from '@nestjs/common';
import { DataServicesModule } from '@/src/infrastructure/data-services/data-services.module';
import { BcryptServiceModule } from '@/src/infrastructure/services/bcrypt/bcrypt.module';
import { UserUseCaseFactory } from './user-use-case-factory';
import { UserUseCaseService } from './user-use-case.service';
import { AuthModule } from '@/src/infrastructure/services/auth/auth.module';
import { UserUseCaseHelper } from './user-use-case.helper';
@Module({
  imports: [DataServicesModule, BcryptServiceModule, AuthModule],
  providers: [UserUseCaseService, UserUseCaseFactory, UserUseCaseHelper],
  exports: [UserUseCaseService],
})
export class UserUseCaseServiceModule {}
