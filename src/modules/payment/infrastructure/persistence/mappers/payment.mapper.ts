import { Injectable } from '@nestjs/common';
import { Payment } from '../../../domain/entities/payment.entity';
import { Money } from '../../../domain/value-objects/money.vo';
import { PaymentMetadata } from '../../../domain/value-objects/payment-metadata.vo';
import { PaymentStatus } from '../../../domain/enums/payment-status.enum';
import { PaymentPersistenceEntity } from '../entities/payment-persistence.entity';
import { BaseMapper } from '@/modules/shared/infrastructure/persistence/base/persistence-mapper.base';

@Injectable()
export class PaymentMapper extends BaseMapper<Payment, PaymentPersistenceEntity> {
  toDomain(entity: PaymentPersistenceEntity): Payment {
    return Payment.load({
      id: entity.id,
      amount: Money.create(Number(entity.amount), entity.currency),
      status: entity.status as PaymentStatus,
      customerId: entity.customerId,
      description: entity.description || undefined,
      metadata: entity.metadata ? PaymentMetadata.create(entity.metadata) : undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(domain: Payment): PaymentPersistenceEntity {
    const entity = new PaymentPersistenceEntity();
    entity.id = domain.id as string;
    entity.amount = domain.amount.amount;
    entity.currency = domain.amount.currency;
    entity.status = domain.status;
    entity.customerId = domain.customerId;
    entity.description = domain.description || null;
    entity.metadata = domain.metadata?.props || null;
    entity.createdAt = domain.props.createdAt as Date;
    entity.updatedAt = domain.props.updatedAt as Date;
    return entity;
  }
}
