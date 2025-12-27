import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigService } from '@/core/config/app.config';
import databaseConfig from '@/core/database/typeorm.config';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [databaseConfig],
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
