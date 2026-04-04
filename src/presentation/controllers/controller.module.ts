import { Module } from '@nestjs/common';
import { AuthControllerModule } from './auth/auth-controller.module';
import { UserControllerModule } from './user/user-controller.module';

@Module({
  imports: [AuthControllerModule, UserControllerModule],
  exports: [AuthControllerModule, UserControllerModule],
})
export class ControllerModule {}
