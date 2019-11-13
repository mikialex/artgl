import { RenderEngine } from './engine/render-engine';

export type Nullable<T> = T | null;

export type Filter<T> = (item: T) => boolean;

export type FloatArray = number[] | Float32Array;

export interface GraphicResourceReleasable{
  releaseGraphics(engine: RenderEngine): void;
}
