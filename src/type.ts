import { GLRenderer } from './webgl/gl-renderer';

export type Nullable<T> = T | null;

export type Filter<T> = (item: T) => boolean;

export interface GLRealeaseable {
  releaseGL(renderer: GLRenderer): void;
}