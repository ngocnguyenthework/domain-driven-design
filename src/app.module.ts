import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@/core/config/app.config';
import { ConfigModule } from '@/core/config/config.module';
import { PaymentModule } from './modules/payment/payment.module';

const businessModules = [PaymentModule];

const featureModules = [
  ConfigModule,
  TypeOrmModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => configService.dbConfig,
  }),
];

@Module({
  imports: [...featureModules, ...businessModules],
  controllers: [],
  providers: [],
})
export class AppModule {}
