/* eslint-disable @typescript-eslint/no-unsafe-call */
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Environment } from '@/common/enums/app.enum';
import { DataSourceOptions } from 'typeorm';
import { registerAs } from '@nestjs/config';
import { DATABASE_CONFIG_TOKEN } from '@/common/constants/app.constant';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { config } from 'dotenv';

config();

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',

  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  namingStrategy: new SnakeNamingStrategy(),
  autoLoadEntities: true,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/core/database/migrations/*.js'],

  migrationsRun: false,
  synchronize: true,
  dropSchema: false,

  logging: process.env.NODE_ENV === Environment.DEVELOPMENT,
  useUTC: true,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

export const dbConfig: DataSourceOptions = {
  ...typeOrmConfig,
} as DataSourceOptions;

export default registerAs(DATABASE_CONFIG_TOKEN, () => dbConfig);
