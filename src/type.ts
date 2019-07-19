import { GLRenderer } from './webgl/gl-renderer';
import { ARTEngine } from './engine/render-engine';

export type Nullable<T> = T | null;

export type Filter<T> = (item: T) => boolean;

export interface GLReleasable {
  releaseGL(renderer: GLRenderer): void;
}

export interface GraphicResourceReleasable{
  releaseGraphics(engine: ARTEngine): void;
}