export interface IBaseEntity {
  id: (number | string) | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}
export type IEntity<T> = T & IBaseEntity;

export type ICreateEntity<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

export type IPersistedEntity<T extends IBaseEntity> = T & {
  [K in 'id' | 'createdAt' | 'updatedAt']: NonNullable<T[K]>;
};

export type ILoadedEntity<T extends IBaseEntity> = IPersistedEntity<T> & {
  readonly id: NonNullable<T['id']>;
  readonly createdAt: NonNullable<T['createdAt']>;
  readonly updatedAt: NonNullable<T['updatedAt']>;
};
