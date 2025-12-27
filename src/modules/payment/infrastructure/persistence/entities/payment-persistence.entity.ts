import { BaseUUIDEntity } from '@/core/database/entities/base.entity';
import { PaymentStatus } from '@/modules/payment/domain/enums/payment-status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Entity, Column } from 'typeorm';

@Entity('payments')
export class PaymentPersistenceEntity extends BaseUUIDEntity {
  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ApiProperty()
  @Column('varchar', { length: 3 })
  currency: string;

  @ApiProperty()
  @Column('enum', {
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @ApiProperty()
  @Column('varchar')
  customerId: string;

  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  @Column('varchar', { nullable: true })
  description: string | null;

  @ApiProperty({
    nullable: true,
  })
  @Column('jsonb', { nullable: true })
  metadata: Record<string, unknown> | null;
}
