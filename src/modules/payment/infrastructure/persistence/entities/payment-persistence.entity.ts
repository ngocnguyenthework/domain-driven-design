import { BaseUUIDEntity } from '@/core/database/entities/base.entity';
import { Entity, Column } from 'typeorm';

@Entity('payments')
export class PaymentPersistenceEntity extends BaseUUIDEntity {
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('varchar', { length: 3 })
  currency: string;

  @Column('enum', {
    enum: ['PENDING', 'COMPLETED', 'FAILED'],
    default: 'PENDING',
  })
  status: string;

  @Column('varchar')
  customerId: string;

  @Column('varchar', { nullable: true })
  description: string | null;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, unknown> | null;
}
