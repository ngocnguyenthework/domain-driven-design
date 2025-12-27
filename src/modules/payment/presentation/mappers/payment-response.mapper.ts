import { Injectable } from '@nestjs/common';
import { ResponseMapper } from '@/modules/shared/presentation/base/presentation-mapper.base';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentResponseDto } from '../dtos/payment-response.dto';
import { ILoadedEntity } from '@/modules/shared/domain/types/domain-entity.type';

@Injectable()
export class PaymentResponseMapper extends ResponseMapper<
  Payment,
  PaymentResponseDto
> {
  toDto(entity: ILoadedEntity<Payment>): PaymentResponseDto {
    return {
      id: entity.id,
      amount: entity.amount.amount,
      currency: entity.amount.currency,
      status: entity.status,
      customerId: entity.customerId,
      description: entity.description,
      metadata: entity.metadata?.['props'],
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
