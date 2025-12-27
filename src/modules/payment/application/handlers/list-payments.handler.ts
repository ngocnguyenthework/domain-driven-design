import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListPaymentsQuery } from '../queries/list-payments.query';
import { Inject, Injectable } from '@nestjs/common';
import {
  type IPaymentRepository,
  PAYMENT_REPOSITORY_TOKEN,
} from '../../domain/repositories/payment-repository.interface';
import { ILoadedEntity } from '@/modules/shared/domain/types/domain-entity.type';
import { IPaginatedResult } from '@/modules/shared/domain/types/domain-repository.type';
import { Payment } from '../../domain/entities/payment.entity';

@Injectable()
@QueryHandler(ListPaymentsQuery)
export class ListPaymentsHandler implements IQueryHandler<ListPaymentsQuery> {
  constructor(
    @Inject(PAYMENT_REPOSITORY_TOKEN)
    private readonly repository: IPaymentRepository,
  ) {}

  async execute(
    query: ListPaymentsQuery,
  ): Promise<IPaginatedResult<ILoadedEntity<Payment>>> {
    return this.repository.findWithPagination(
      {},
      { page: query.page, limit: query.limit },
    );
  }
}
