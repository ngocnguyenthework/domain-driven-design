/* eslint-disable @typescript-eslint/no-unused-vars */
import { AggregateRoot as NestAggregateRoot } from '@nestjs/cqrs';
import type { IBaseEntity } from '../types/domain-entity.type';

export abstract class BaseEntity<
  T extends IBaseEntity,
> extends NestAggregateRoot {
  constructor(
    public readonly id: (number | string) | null,
    public readonly createdOn: Date | null,
    public readonly updatedOn: Date | null,
  ) {
    super();
  }

  equals(entity: BaseEntity<T>): boolean {
    if (this === entity) {
      return true;
    }

    if (!this.id || !entity.id) {
      return false;
    }

    return this.id === entity.id;
  }

  isNew(): boolean {
    return !this.id;
  }

  static create(_props: unknown): unknown {
    throw new Error('create method must be implemented by derived class');
  }

  static load(_props: unknown): unknown {
    throw new Error('load method must be implemented by derived class');
  }
}
