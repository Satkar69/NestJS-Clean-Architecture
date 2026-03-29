import { Module } from '@nestjs/common';
import { UserUseCaseModule } from '@/src/core/application/use-cases/user/user-use-case.module';
import { UserController } from './user.controller';
import { ClsStoreModule } from '@/src/infrastructure/services/cls-store/cls-store.module';

@Module({
  imports: [UserUseCaseModule, ClsStoreModule],
  controllers: [UserController],
})
export class UserControllerModule {}
