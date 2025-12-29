import { PickType } from '@nestjs/swagger';
import { PaymentPersistenceEntity } from '@/modules/payment/infrastructure/persistence/entities/payment-persistence.entity';

export class PaymentResponseDto extends PickType(PaymentPersistenceEntity, [
  'id',
  'amount',
  'currency',
  'status',
  'customerId',
  'description',
  'metadata',
  'createdAt',
  'updatedAt',
]) {}
