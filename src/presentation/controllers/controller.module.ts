import { Module } from '@nestjs/common';
import { AuthControllerModule } from './auth/auth-controller.module';

@Module({
  imports: [AuthControllerModule],
  exports: [AuthControllerModule],
})
export class ControllerModule {}
