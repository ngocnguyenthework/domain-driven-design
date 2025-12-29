import type {
  IBaseEntity,
  ILoadedEntity,
} from '@/modules/shared/domain/types/domain-entity.type';

export interface MappingOptions {
  /**
   * Explicitly specify which fields to include (whitelist approach)
   * If provided, only these fields will be mapped
   */
  include?: string[];

  /**
   * Specify which fields to exclude (blacklist approach)
   * These fields will be skipped during mapping
   */
  exclude?: string[];

  /**
   * Custom field transformations
   * Key: entity field name, Value: transformation function
   */
  transform?: Record<string, (value: unknown, domain: unknown) => unknown>;

  /**
   * Custom field mappings (when domain and entity field names differ)
   * Key: entity field name, Value: domain field name
   */
  fieldMap?: Record<string, string>;
}

/**
 * Base Mapper interface for converting between Domain Entities and Persistence Entities
 * Following Domain-Driven Design (DDD) principles
 *
 * @template DomainEntity - Domain model (business logic layer)
 * @template PersistenceEntity - Database entity (TypeORM entity)
 * @template CreateDTO - DTO for creating entities
 * @template UpdateDTO - DTO for updating entities
 */
export interface IMapper<DomainEntity extends IBaseEntity, PersistenceEntity> {
  /**
   * Convert persistence entity to domain entity
   * @param entity - TypeORM entity from database
   * @returns Domain entity with business logic
   */
  toDomain(entity: PersistenceEntity): ILoadedEntity<DomainEntity>;

  /**
   * Convert multiple persistence entities to domain entities
   * @param entities - Array of TypeORM entities
   * @returns Array of domain entities
   */
  toDomainMany(entities: PersistenceEntity[]): ILoadedEntity<DomainEntity>[];

  /**
   * Convert domain entity to persistence entity
   * @param domain - Domain entity
   * @returns TypeORM entity for database persistence
   */
  toPersistence(domain: DomainEntity): PersistenceEntity;

  /**
   * Convert multiple domain entities to persistence entities
   * @param domains - Array of domain entities
   * @returns Array of TypeORM entities
   */
  toPersistenceMany(domains: DomainEntity[]): PersistenceEntity[];
}
