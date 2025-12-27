import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentController } from './presentation/controllers/payment.controller';
import { PaymentResponseMapper } from './presentation/mappers/payment-response.mapper';
import { PaymentRepository } from './infrastructure/persistence/repositories/payment.repository';
import { PaymentMapper } from './infrastructure/persistence/mappers/payment.mapper';
import { PaymentPersistenceEntity } from './infrastructure/persistence/entities/payment-persistence.entity';
import { CreatePaymentHandler } from './application/handlers/create-payment.handler';
import { GetPaymentHandler } from './application/handlers/get-payment.handler';
import { ListPaymentsHandler } from './application/handlers/list-payments.handler';
import { PAYMENT_REPOSITORY_TOKEN } from './domain/repositories/payment-repository.interface';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([PaymentPersistenceEntity])],
  controllers: [PaymentController],
  providers: [
    PaymentMapper,
    PaymentResponseMapper,
    CreatePaymentHandler,
    GetPaymentHandler,
    ListPaymentsHandler,
    { provide: PAYMENT_REPOSITORY_TOKEN, useClass: PaymentRepository },
  ],
  exports: [PAYMENT_REPOSITORY_TOKEN],
})
export class PaymentModule {}
