import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentPersistenceEntity } from '../entities/payment-persistence.entity';
import { PaymentMapper } from '../mappers/payment.mapper';
import { Payment } from '../../../domain/entities/payment.entity';
import { BaseRepository } from '@/modules/shared/infrastructure/persistence/base/persistence-repository.base';

@Injectable()
export class PaymentRepository extends BaseRepository<Payment, PaymentPersistenceEntity> {
  constructor(
    @InjectRepository(PaymentPersistenceEntity)
    repository: Repository<PaymentPersistenceEntity>,
    mapper: PaymentMapper,
  ) {
    super(repository, mapper);
  }
}
