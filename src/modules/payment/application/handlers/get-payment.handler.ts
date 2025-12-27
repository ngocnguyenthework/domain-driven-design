import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetPaymentQuery } from '../queries/get-payment.query';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  type IPaymentRepository,
  PAYMENT_REPOSITORY_TOKEN,
} from '../../domain/repositories/payment-repository.interface';
import { Payment } from '../../domain/entities/payment.entity';
import { ILoadedEntity } from '@/modules/shared/domain/types/domain-entity.type';

@Injectable()
@QueryHandler(GetPaymentQuery)
export class GetPaymentHandler implements IQueryHandler<GetPaymentQuery> {
  constructor(
    @Inject(PAYMENT_REPOSITORY_TOKEN)
    private readonly repository: IPaymentRepository,
  ) {}

  async execute(query: GetPaymentQuery): Promise<ILoadedEntity<Payment>> {
    const payment = await this.repository.findOne({ id: query.id });

    if (!payment) {
      throw new NotFoundException(`Payment with id ${query.id} not found`);
    }

    return payment;
  }
}
