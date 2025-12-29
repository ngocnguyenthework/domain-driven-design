import { Money } from '../value-objects/money.vo';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentMetadata } from '../value-objects/payment-metadata.vo';
import { AggregateRoot } from '@/modules/shared/domain/base/domain-aggregate.base';
import { PaymentPersistenceEntity } from '../../infrastructure/persistence/entities/payment-persistence.entity';
import {
  IEntity,
  ILoadedEntity,
} from '@/modules/shared/domain/types/domain-entity.type';
import { IPaymentProperties } from '../types/payment.type';

export class Payment
  extends AggregateRoot<IEntity<IPaymentProperties>>
  implements IEntity<IPaymentProperties>
{
  private constructor(
    public readonly id: string | null,
    public readonly createdAt: Date | null,
    public readonly updatedAt: Date | null,
    public status: PaymentStatus,
    public amount: Money,
    public metadata: PaymentMetadata,
    public customerId: string,
    public description: string | null,
  ) {
    super(id, createdAt, updatedAt);
  }

  public static create(props: Omit<IPaymentProperties, 'status'>): Payment {
    return new Payment(
      null,
      null,
      null,
      PaymentStatus.PENDING,
      props.amount,
      props.metadata,
      props.customerId,
      props.description,
    );
  }

  public static load(
    props: ILoadedEntity<PaymentPersistenceEntity>,
  ): ILoadedEntity<Payment> {
    return new Payment(
      props.id,
      props.createdAt,
      props.updatedAt,
      props.status,
      Money.create(props.amount, props.currency),
      PaymentMetadata.create(props.metadata || {}),
      props.customerId,
      props.description,
    ) as ILoadedEntity<Payment>;
  }

  public complete(): void {
    if (this.status !== PaymentStatus.PENDING) {
      throw new Error('Can only complete pending payments');
    }
    this.status = PaymentStatus.COMPLETED;
  }

  public fail(): void {
    if (this.status !== PaymentStatus.PENDING) {
      throw new Error('Can only fail pending payments');
    }
    this.status = PaymentStatus.FAILED;
  }
}
