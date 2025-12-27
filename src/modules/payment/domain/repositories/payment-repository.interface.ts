/* eslint-disable @typescript-eslint/no-empty-object-type */
import { IBaseRepository } from '@/modules/shared/domain/types/domain-repository.type';
import { PaymentPersistenceEntity } from '../../infrastructure/persistence/entities/payment-persistence.entity';
import { Payment } from '../entities/payment.entity';

export const PAYMENT_REPOSITORY_TOKEN = Symbol('PAYMENT_REPOSITORY_TOKEN');

export interface IPaymentRepository extends IBaseRepository<
  Payment,
  PaymentPersistenceEntity
> {}
