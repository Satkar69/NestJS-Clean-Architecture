import { Module } from '@nestjs/common';
import { pgDatabaseProvider } from './providers/pgDatabase.provider';

@Module({
  providers: [...pgDatabaseProvider],
  exports: [...pgDatabaseProvider],
})
export class PgDataServicesModule {}
