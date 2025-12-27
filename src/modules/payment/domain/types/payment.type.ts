import { PaymentPersistenceEntity } from '../../infrastructure/persistence/entities/payment-persistence.entity';
import { Money } from '../value-objects/money.vo';
import { PaymentMetadata } from '../value-objects/payment-metadata.vo';

export type IPaymentProperties = Pick<
  PaymentPersistenceEntity,
  'status' | 'customerId' | 'description'
> & {
  amount: Money;
  metadata: PaymentMetadata;
};
