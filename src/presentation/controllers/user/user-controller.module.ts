import { Module } from '@nestjs/common';
import { UserServiceModule } from 'src/core/application/use-cases/user-use-cases/user-service.module';
import { UserController } from './user.controller';
import { ClsStoreModule } from 'src/infrastructure/services/cls-store/cls-store.module';

@Module({
  imports: [UserServiceModule, ClsStoreModule],
  controllers: [UserController],
})
export class UserControllerModule {}
