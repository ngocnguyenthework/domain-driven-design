import { DATABASE_CONFIG_TOKEN } from '@/common/constants/app.constant';
import { Environment } from '@/common/enums/app.enum';
import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { type DataSourceOptions } from 'typeorm';

@Injectable()
export class ConfigService {
  constructor(private _nestConfigService: NestConfigService) {}

  get port(): number {
    return this.getNumber('PORT') || 3001;
  }

  get env(): Environment {
    return this.get('NODE_ENV') || Environment.DEVELOPMENT;
  }

  get isDevelopment(): boolean {
    return this.env === Environment.DEVELOPMENT;
  }

  get isProduction(): boolean {
    return this.env === Environment.PRODUCTION;
  }

  get<T = string>(param: string): T | undefined {
    return this._nestConfigService.get<T>(param);
  }

  getNumber(param: string): number {
    return +this._nestConfigService.get(param);
  }

  getOrThrow<T = string>(param: string): T {
    return this._nestConfigService.getOrThrow(param);
  }

  getNumberOrThrow(param: string): number {
    const numberEnv = +this._nestConfigService.getOrThrow(param);

    if (isNaN(numberEnv)) {
      throw Error(`${param} is not a number`);
    }

    return +this._nestConfigService.getOrThrow(param);
  }

  get dbConfig(): DataSourceOptions {
    return this.getOrThrow<DataSourceOptions>(DATABASE_CONFIG_TOKEN);
  }
}
