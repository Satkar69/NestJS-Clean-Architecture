import { Module } from '@nestjs/common';
import { ClsStoreModule } from '@/src/infrastructure/services/cls-store/cls-store.module';
import { UserController } from './user.controller';

@Module({
  imports: [ClsStoreModule],
  controllers: [UserController],
})
export class UserControllerModule {}
