import { Module } from '@nestjs/common';
import { UserUseCaseServiceModule } from '@/src/core/application/use-cases/user-use-cases/user-use-case-service.module';
import { UserController } from './user.controller';
import { ClsStoreModule } from '@/src/infrastructure/services/cls-store/cls-store.module';

@Module({
  imports: [UserUseCaseServiceModule, ClsStoreModule],
  controllers: [UserController],
})
export class UserControllerModule {}
