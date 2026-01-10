import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export const createPgDataSource = (configService: ConfigService) => {
  return new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    schema: process.env.DB_SCHEMA,
    synchronize: process.env.DB_SYNC === 'true',
    entities: [`${__dirname}/entities/*{.ts,.js}`],
    migrations: [`${__dirname}/../../../migrations/*{.ts,.js}`],
  });
};
