import type { IBaseEntity, ILoadedEntity } from './domain-entity.type';

export type Id = string | number;
export interface IBaseRepository<
  DomainEntity extends IBaseEntity,
  PersistenceEntity,
> {
  save(entity: DomainEntity): Promise<ILoadedEntity<DomainEntity>>;
  saveMany(entities: DomainEntity[]): Promise<ILoadedEntity<DomainEntity>[]>;

  findOne(
    criteria: Partial<PersistenceEntity>,
  ): Promise<ILoadedEntity<DomainEntity> | null>;
  find(
    criteria?: Partial<PersistenceEntity>,
  ): Promise<ILoadedEntity<DomainEntity>[]>;
  findWithPagination(
    criteria?: Partial<PersistenceEntity>,
    pageOptions?: {
      page?: number;
      limit?: number;
    },
  ): Promise<IPaginatedResult<ILoadedEntity<DomainEntity>>>;

  delete(id: Id): Promise<boolean>;
  deleteMany(ids: Id[]): Promise<number>;

  exists(id: Id): Promise<boolean>;
  count(criteria?: Partial<PersistenceEntity>): Promise<number>;
}

export interface IPaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
