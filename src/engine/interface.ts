import { RenderEngine } from "./render-engine";

export interface Renderable {
  render(engine: RenderEngine): void;
}

export interface IRenderEngine {

  //// render APIs
  render(anything: Renderable): void;
}