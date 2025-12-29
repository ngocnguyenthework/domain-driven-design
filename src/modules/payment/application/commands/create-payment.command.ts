import { Command } from '@nestjs/cqrs';
import { Payment } from '../../domain/entities/payment.entity';
import { ILoadedEntity } from '@/modules/shared/domain/types/domain-entity.type';

export class CreatePaymentCommand extends Command<ILoadedEntity<Payment>> {
  constructor(
    public readonly amount: number,
    public readonly currency: string,
    public readonly customerId: string,
    public readonly description?: string,
    public readonly metadata?: Record<string, unknown>,
  ) {
    super();
  }
}
