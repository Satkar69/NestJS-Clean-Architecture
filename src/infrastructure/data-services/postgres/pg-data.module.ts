import { Module } from '@nestjs/common';
import { pgDatabaseProvider } from './providers/pgDatabase.provider';
import { ClsStoreModule } from 'src/infrastructure/services/cls-store/cls-store.module';
import providers from './providers';
import { IPgDataServices } from 'src/core/application/ports/out/data-services/postgres/pg-data-services.abstract';
import { PgDataService } from './pg-data.service';

@Module({
  imports: [ClsStoreModule],
  providers: [
    ...providers,
    {
      provide: IPgDataServices,
      useClass: PgDataService,
    },
  ],
  exports: [...pgDatabaseProvider, IPgDataServices],
})
export class PgDataServicesModule {}
