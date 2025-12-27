import type {
  IBaseEntity,
  IEntity,
  ILoadedEntity,
  IPersistedEntity,
} from '@/payment/shared/domain/types/domain-entity.type';
import type { IMapper, MappingOptions } from '../types/persistence-mapper.type';

export abstract class BaseMapper<
  DomainEntity extends IBaseEntity,
  PersistenceEntity,
> implements IMapper<DomainEntity, PersistenceEntity> {
  abstract toDomain(entity: PersistenceEntity): ILoadedEntity<DomainEntity>;

  abstract toPersistence(domain: DomainEntity): PersistenceEntity;

  toDomainMany(entities: PersistenceEntity[]): ILoadedEntity<DomainEntity>[] {
    return entities.map((entity) => this.toDomain(entity));
  }

  toPersistenceMany(domains: DomainEntity[]): PersistenceEntity[] {
    return domains.map((domain) => this.toPersistence(domain));
  }

  protected toPlainObject<T extends object>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T;
  }

  protected autoMapToDomain<T extends DomainEntity>(
    DomainClass: {
      load: (
        props: IPersistedEntity<IEntity<Record<string, any>>>,
      ) => ILoadedEntity<T>;
    },
    persistence: PersistenceEntity,
    options: MappingOptions = {},
  ): ILoadedEntity<DomainEntity> {
    let persistenceKeys = this._getEntityKeys(persistence);
    const baseKeys = this._getBaseEntityKeys();

    const { include = [], exclude = [] } = options;

    if (include.length > 0) {
      persistenceKeys = persistenceKeys.filter(
        (key) =>
          options.include!.includes(key) &&
          !baseKeys.includes(key as keyof IBaseEntity),
      );
    }

    if (exclude.length > 0) {
      const excludeSet = new Set(options.exclude);
      persistenceKeys = persistenceKeys.filter(
        (key) =>
          !excludeSet.has(key) && !baseKeys.includes(key as keyof IBaseEntity),
      );
    }

    const createDomainProps: Record<string, unknown> = {};

    persistenceKeys.forEach((persistenceKey) => {
      const key = options.fieldMap?.[persistenceKey] || persistenceKey;

      let value = (persistence as Record<string, unknown>)[key];

      if (value === undefined) return;

      if (options.transform?.[key]) {
        value = options.transform[key](value, persistence);
      }

      createDomainProps[key] = value;
    });

    return DomainClass.load(
      createDomainProps as IPersistedEntity<IEntity<Record<string, unknown>>>,
    );
  }

  /**
   *  Auto map domain entity to persistence entity
   * @param EntityClass
   * @param domain
   * @param options
   * @returns PersistenceEntity
   */
  protected autoMapToPersistence(
    PersistenceClass: new () => PersistenceEntity,
    domain: DomainEntity,
    options: MappingOptions = {},
  ): PersistenceEntity {
    const persistence = new PersistenceClass();
    let persistenceKeys = this._getEntityKeys(persistence);

    const { include = [], exclude = [] } = options;

    if (include.length > 0) {
      persistenceKeys = persistenceKeys.filter((key) =>
        options.include!.includes(key),
      );
    }

    if (exclude.length > 0) {
      const excludeSet = new Set(options.exclude);
      persistenceKeys = persistenceKeys.filter((key) => !excludeSet.has(key));
    }

    persistenceKeys.forEach((entityKey) => {
      const domainKey = options.fieldMap?.[entityKey] || entityKey;

      let value = (domain as Record<string, unknown>)[domainKey];

      if (value === undefined) {
        return;
      }

      if (options.transform?.[entityKey]) {
        value = options.transform[entityKey](value, domain);
      }

      (persistence as Record<string, unknown>)[domainKey] = value;
    });

    return persistence;
  }

  private _getEntityKeys(entity: DomainEntity | PersistenceEntity): string[] {
    const keys = new Set<string>();

    Object.getOwnPropertyNames(entity).forEach((key) => keys.add(key));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    let currentPrototype = Object.getPrototypeOf(entity);
    while (currentPrototype && currentPrototype !== Object.prototype) {
      Object.getOwnPropertyNames(currentPrototype)
        .filter((key) => key !== 'constructor')
        .forEach((key) => keys.add(key));

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      currentPrototype = Object.getPrototypeOf(currentPrototype);
    }

    return Array.from(keys);
  }

  private _getBaseEntityKeys(): (keyof IBaseEntity)[] {
    return ['id', 'createdAt', 'updatedAt'];
  }
}
