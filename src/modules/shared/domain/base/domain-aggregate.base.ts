/* eslint-disable @typescript-eslint/no-unused-vars */
import type { IBaseEntity } from '../types/domain-entity.type';
import { BaseEntity } from './domain-entity.base';

export abstract class AggregateRoot<
  T extends IBaseEntity,
> extends BaseEntity<T> {
  static create(_props: unknown): unknown {
    throw new Error('create method must be implemented by derived class');
  }

  static load(_props: unknown): unknown {
    throw new Error('load method must be implemented by derived class');
  }
}
