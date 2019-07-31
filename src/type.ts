import { GLRenderer } from './webgl/gl-renderer';
import { RenderEngine } from './engine/render-engine';

export type Nullable<T> = T | null;

export type Filter<T> = (item: T) => boolean;

export interface GLReleasable {
  releaseGL(renderer: GLRenderer): void;
}

export interface GraphicResourceReleasable{
  releaseGraphics(engine: RenderEngine): void;
}
