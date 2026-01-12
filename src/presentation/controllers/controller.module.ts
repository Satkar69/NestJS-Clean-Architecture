import { Module } from '@nestjs/common';
import { UserControllerModule } from './user/user-controller.module';

@Module({
  imports: [UserControllerModule],
  exports: [UserControllerModule],
})
export class ControllerModule {}
