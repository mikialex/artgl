import { RenderEngine } from './engine/render-engine';

export interface GraphicResourceReleasable{
  releaseGraphics(engine: RenderEngine): void;
}
