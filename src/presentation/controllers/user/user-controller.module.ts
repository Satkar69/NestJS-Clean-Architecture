import { Module } from '@nestjs/common';
import { UserServiceModule } from 'src/core/application/use-cases/user-use-cases/user-service.module';
import { UserController } from './user.controller';

@Module({
  imports: [UserServiceModule],
  controllers: [UserController],
})
export class UserControllerModule {}
