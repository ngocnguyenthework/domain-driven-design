import { ILoadedEntity } from '@/modules/shared/domain/types/domain-entity.type';
import { Query } from '@nestjs/cqrs';
import { Payment } from '../../domain/entities/payment.entity';

export class GetPaymentQuery extends Query<ILoadedEntity<Payment>> {
  constructor(public readonly id: string) {
    super();
  }
}
