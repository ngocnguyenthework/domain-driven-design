import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @CreateDateColumn({
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    type: 'timestamptz',
    nullable: true,
  })
  deletedAt: Date | null;
}

export abstract class BaseUUIDEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}

export abstract class BaseIncrementEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;
}
