import { Module } from '@nestjs/common';
import { pgDatabaseProvider } from './providers/pgDatabase.provider';
import { ClsStoreModule } from 'src/infrastructure/services/cls-store/cls-store.module';
import providers from './providers';
import { IDataServices } from 'src/core/domain/abstracts/data-services.abstract';
import { PgDataService } from './pg-data.service';

@Module({
  imports: [ClsStoreModule],
  providers: [
    ...providers,
    {
      provide: IDataServices,
      useClass: PgDataService,
    },
  ],
  exports: [...pgDatabaseProvider, IDataServices],
})
export class PgDataServicesModule {}
