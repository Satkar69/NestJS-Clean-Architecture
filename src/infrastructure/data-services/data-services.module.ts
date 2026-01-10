import { Module } from '@nestjs/common';
import { PgDataServicesModule } from './postgres/pg-data-services.module';

@Module({
  imports: [PgDataServicesModule],
  exports: [PgDataServicesModule],
})
export class DataServicesModule {}
