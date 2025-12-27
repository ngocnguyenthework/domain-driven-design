export interface IBaseEntity {
  id: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}
export type IEntity<T> = T & IBaseEntity;

export type ICreateEntity<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

export type IPersistedEntity<T extends IBaseEntity> = T & {
  [K in 'id' | 'createdAt']: NonNullable<IBaseEntity[K]>;
};

export type ILoadedEntity<T extends IBaseEntity> = IPersistedEntity<T>;
