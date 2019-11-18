
export type Nullable<T> = T | null;

export type Filter<T> = (item: T) => boolean;

export type FloatArray = number[] | Float32Array;