import { Injectable } from '@nestjs/common';
import { PaymentPersistenceEntity } from '../entities/payment-persistence.entity';
import { Payment } from '../../../domain/entities/payment.entity';
import { IPaymentRepository } from '../../../domain/repositories/payment-repository.interface';
import { BaseRepository } from '@/modules/shared/infrastructure/persistence/base/persistence-repository.base';
import { Repository } from 'typeorm';
import { PaymentMapper } from '../mappers/payment.mapper';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PaymentRepository
  extends BaseRepository<Payment, PaymentPersistenceEntity>
  implements IPaymentRepository
{
  constructor(
    @InjectRepository(PaymentPersistenceEntity)
    repository: Repository<PaymentPersistenceEntity>,
    mapper: PaymentMapper,
  ) {
    super(repository, mapper);
  }
}
