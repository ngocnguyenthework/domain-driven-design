import { Query } from '@nestjs/cqrs';
import { ILoadedEntity } from '@/modules/shared/domain/types/domain-entity.type';
import { Payment } from '../../domain/entities/payment.entity';
import { IPaginatedResult } from '@/modules/shared/domain/types/domain-repository.type';

export class ListPaymentsQuery extends Query<
  IPaginatedResult<ILoadedEntity<Payment>>
> {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 10,
  ) {
    super();
  }
}
