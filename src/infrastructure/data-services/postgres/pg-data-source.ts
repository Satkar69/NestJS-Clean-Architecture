import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export const createPgDataSource = (configService: ConfigService) => {
  return new DataSource({
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USER'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    schema: configService.get<string>('DB_SCHEMA'),
    synchronize: configService.get<boolean>('DB_SYNC'),
    entities: [`${__dirname}/entities/*{.ts,.js}`],
    migrations: [`${__dirname}/../../../migrations/*{.ts,.js}`],
  });
};
