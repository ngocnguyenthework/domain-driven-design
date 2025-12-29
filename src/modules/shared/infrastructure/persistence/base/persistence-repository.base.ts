import {
  type FindOptionsWhere,
  In,
  type Repository,
  type FindManyOptions,
} from 'typeorm';
import type { IMapper } from '@/modules/shared/infrastructure/persistence/types/persistence-mapper.type';
import { BadRequestException } from '@nestjs/common';
import type {
  IBaseRepository,
  Id,
  IPaginatedResult,
} from '@/modules/shared/domain/types/domain-repository.type';
import type {
  IBaseEntity,
  ILoadedEntity,
} from '@/modules/shared/domain/types/domain-entity.type';
import { BaseEntity } from '@/core/database/entities/base.entity';

export abstract class BaseRepository<
  DomainEntity extends IBaseEntity,
  PersistenceEntity extends BaseEntity,
> implements IBaseRepository<DomainEntity, PersistenceEntity> {
  constructor(
    protected readonly repository: Repository<PersistenceEntity>,
    protected readonly mapper: IMapper<DomainEntity, PersistenceEntity>,
  ) {}

  protected getEntityName(): string {
    return this.repository.metadata.tableName;
  }

  protected getRepository(): Repository<PersistenceEntity> {
    return this.repository;
  }

  async find(
    criteria: Partial<PersistenceEntity> = {},
  ): Promise<ILoadedEntity<DomainEntity>[]> {
    const entities = await this.findWithDeleted({
      where: criteria as FindOptionsWhere<PersistenceEntity>,
    });
    return this.mapper.toDomainMany(entities);
  }

  protected async findWithDeleted(
    options: FindManyOptions<PersistenceEntity>,
  ): Promise<PersistenceEntity[]> {
    return this.repository.find({ ...options, withDeleted: true });
  }

  async findWithPagination(
    criteria: Partial<PersistenceEntity> = {},
    pageOptions: {
      page: number;
      limit: number;
    } = {
      page: 10,
      limit: 50,
    },
  ): Promise<IPaginatedResult<ILoadedEntity<DomainEntity>>> {
    const { page, limit } = pageOptions;

    if (page < 1 || limit < 1) {
      throw new BadRequestException('Page and limit must be positive numbers');
    }

    const [entities, total] = await this.repository.findAndCount({
      where: criteria as FindOptionsWhere<PersistenceEntity>,
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: this.mapper.toDomainMany(entities),
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    };
  }

  async findOne(
    criteria: Partial<PersistenceEntity>,
  ): Promise<ILoadedEntity<DomainEntity> | null> {
    const entity = await this.repository.findOne({
      where: criteria as FindOptionsWhere<PersistenceEntity>,
    });

    if (!entity) {
      return null;
    }

    return this.mapper.toDomain(entity);
  }

  async save(domain: DomainEntity): Promise<ILoadedEntity<DomainEntity>> {
    const entity = this.mapper.toPersistence(domain);

    const savedEntity = await this.repository.save(entity);
    return this.mapper.toDomain(savedEntity);
  }

  async saveMany(
    domains: DomainEntity[],
  ): Promise<ILoadedEntity<DomainEntity>[]> {
    const entities = this.mapper.toPersistenceMany(domains);
    const createdEntity = this.repository.create(entities);

    const savedEntity = await this.repository.save(createdEntity);
    return this.mapper.toDomainMany(savedEntity);
  }

  async delete(id: Id): Promise<boolean> {
    const result = await this.repository.softDelete(
      id as unknown as FindOptionsWhere<PersistenceEntity>,
    );

    return (result.affected || 0) > 0;
  }

  async deleteMany(ids: (string | number)[]): Promise<number> {
    const result = await this.repository.softDelete(
      In(ids) as unknown as FindOptionsWhere<PersistenceEntity>,
    );

    return result.affected || 0;
  }

  async exists(id: Id): Promise<boolean> {
    const count = await this.repository.count({
      where: { id: id as unknown } as FindOptionsWhere<PersistenceEntity>,
    });

    return count > 0;
  }

  async count(criteria: Partial<PersistenceEntity> = {}): Promise<number> {
    return this.repository.count({
      where: criteria as FindOptionsWhere<PersistenceEntity>,
    });
  }
}
