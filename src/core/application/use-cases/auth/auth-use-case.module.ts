import { Module } from '@nestjs/common';
import { DataServicesModule } from '@/src/infrastructure/data-services/data-services.module';
import { BcryptServiceModule } from '@/src/infrastructure/services/bcrypt/bcrypt.module';
import { AuthUseCaseFactory } from './auth-use-case-factory';
import { AuthUseCaseHelper } from './auth-use-case.helper';
import { AuthUseCaseService } from './auth-use-case.service';
import { AuthModule } from '@/src/infrastructure/services/auth/auth.module';
import { UserUseCaseModule } from '../user/user-use-case.module';
@Module({
  imports: [
    DataServicesModule,
    BcryptServiceModule,
    AuthModule,
    UserUseCaseModule,
  ],
  providers: [AuthUseCaseFactory, AuthUseCaseHelper, AuthUseCaseService],
  exports: [AuthUseCaseService],
})
export class AuthUseCaseModule {}
