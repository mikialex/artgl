export type Nullable<T> = T | null;

export type Filter<T> = (item: T) => boolean;