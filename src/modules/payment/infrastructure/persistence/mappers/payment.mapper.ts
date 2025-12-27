import { Injectable } from '@nestjs/common';
import { Payment } from '../../../domain/entities/payment.entity';
import { PaymentPersistenceEntity } from '../entities/payment-persistence.entity';
import { BaseMapper } from '@/modules/shared/infrastructure/persistence/base/persistence-mapper.base';
import { ILoadedEntity } from '@/modules/shared/domain/types/domain-entity.type';

@Injectable()
export class PaymentMapper extends BaseMapper<
  Payment,
  PaymentPersistenceEntity
> {
  toDomain(entity: PaymentPersistenceEntity): ILoadedEntity<Payment> {
    return this.autoMapToDomain(Payment, entity);
  }
  toPersistence(domain: Payment): PaymentPersistenceEntity {
    const persistence = this.autoMapToPersistence(
      PaymentPersistenceEntity,
      domain,
    );

    persistence.amount = domain.amount.amount;
    persistence.currency = domain.amount.currency;
    return persistence;
  }
}
