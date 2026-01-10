import { HttpException, Logger } from '@nestjs/common';
import { createPgDataSource } from '../pg-data-source';
import InjectableString from 'src/shared/constants/injectable-string';
import { ConfigService } from '@nestjs/config';

export const pgDatabaseProvider = [
  {
    provide: InjectableString.APP_DATA_SOURCE,
    useFactory: async (configService: ConfigService) => {
      try {
        const dataSource = createPgDataSource(configService);
        await dataSource.initialize();
        Logger.log(
          'PostgreSQL Data Source has been initialized!',
          'PgDatabaseProvider',
        );
        return dataSource;
      } catch (error) {
        Logger.error(
          'Error during Data Source initialization',
          'PgDatabaseProvider',
          error,
        );
        throw new HttpException(
          error.message || 'Failed to initialize database connection',
          error.status || 500,
        );
      }
    },
  },
];
