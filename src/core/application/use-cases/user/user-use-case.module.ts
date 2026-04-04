import { Module } from '@nestjs/common';
import { DataServicesModule } from '@/src/infrastructure/data-services/data-services.module';
import { UserUseCaseHelper } from './user-use-case.helper';

@Module({
  imports: [DataServicesModule],
  providers: [UserUseCaseHelper],
  exports: [UserUseCaseHelper],
})
export class UserUseCaseModule {}
