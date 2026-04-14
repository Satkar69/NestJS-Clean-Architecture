import { Logger } from '@nestjs/common';
import { AppException } from '@/src/shared/exceptions';
import { createPgDataSource } from '../pg-data-source';
import InjectableString from '@/src/shared/constants/injectable-string';
import { ConfigService } from '@nestjs/config';
import { StatusCodeEnum } from '@/src/shared/enums/status-code.enum';

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
        throw new AppException(
          StatusCodeEnum.INTERNAL_SERVER_ERROR,
          'Failed to initialize database connection',
          undefined,
          {
            service: 'PgDatabaseProvider',
            operation: 'dataSource.initialize',
          },
        );
      }
    },
    inject: [ConfigService],
  },
];
