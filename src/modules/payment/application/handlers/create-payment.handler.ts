import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePaymentCommand } from '../commands/create-payment.command';
import { Payment } from '../../domain/entities/payment.entity';
import { Money } from '../../domain/value-objects/money.vo';
import { PaymentMetadata } from '../../domain/value-objects/payment-metadata.vo';
import { Inject, Injectable } from '@nestjs/common';
import {
  type IPaymentRepository,
  PAYMENT_REPOSITORY_TOKEN,
} from '../../domain/repositories/payment-repository.interface';
import { ILoadedEntity } from '@/modules/shared/domain/types/domain-entity.type';

@Injectable()
@CommandHandler(CreatePaymentCommand)
export class CreatePaymentHandler implements ICommandHandler<CreatePaymentCommand> {
  constructor(
    @Inject(PAYMENT_REPOSITORY_TOKEN)
    private readonly repository: IPaymentRepository,
  ) {}

  async execute(
    command: CreatePaymentCommand,
  ): Promise<ILoadedEntity<Payment>> {
    const money = Money.create(command.amount, command.currency);
    const metadata = command.metadata
      ? PaymentMetadata.create(command.metadata)
      : PaymentMetadata.create({});

    const payment = Payment.create({
      amount: money,
      customerId: command.customerId,
      description: command.description ?? '',
      metadata: metadata,
    });

    // Simulate payment processing
    // In real implementation, this would call a payment gateway
    const isSuccess = Math.random() > 0.1; // 90% success rate

    if (isSuccess) {
      payment.complete();
    } else {
      payment.fail();
    }

    return this.repository.save(payment);
  }
}
