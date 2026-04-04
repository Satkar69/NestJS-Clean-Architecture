import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { ClsStoreModule } from '@/src/infrastructure/services/cls-store/cls-store.module';
import { AuthUseCaseModule } from '@/src/core/application/use-cases/auth/auth-use-case.module';

@Module({
  imports: [AuthUseCaseModule, ClsStoreModule],
  controllers: [AuthController],
})
export class AuthControllerModule {}
