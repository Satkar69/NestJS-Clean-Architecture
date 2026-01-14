import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export const createPgDataSource = (configService: ConfigService) => {
  return new DataSource({
    type: 'postgres',
    host: configService.getOrThrow<string>('DB_HOST'),
    port: configService.getOrThrow<number>('DB_PORT'),
    username: configService.getOrThrow<string>('DB_USER'),
    password: configService.getOrThrow<string>('DB_PASSWORD'),
    database: configService.getOrThrow<string>('DB_NAME'),
    schema: configService.getOrThrow<string>('DB_SCHEMA'),
    synchronize: configService.getOrThrow<boolean>('DB_SYNC'),
    entities: [`${__dirname}/entities/*{.ts,.js}`],
    migrations: [`${__dirname}/../../../migrations/*{.ts,.js}`],
  });
};
