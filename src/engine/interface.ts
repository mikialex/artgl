import { RenderEngine } from "./render-engine";
import { Geometry } from "../core/geometry";
import { Material } from "../core/material";
import { Nullable } from "../type";
import { Shading } from "../core/shading";
import { ShadingParams, RenderRange } from "../core/render-object";

export interface Renderable {
  render(engine: RenderEngine): void;
}

export interface IRenderEngine {

  //// render APIs
  render(anything: Renderable): void;

  //// resource binding
  useGeometry(geometry: Geometry): void;
  useMaterial(material: Material): void;
  useShading(shading: Nullable<Shading>, shadingParams?: ShadingParams): void;
  useRange(geometry: Geometry, range?: RenderRange): void;

  //// viewport
  setViewport(x: number, y: number, width: number, height: number): void 
  setFullScreenViewPort(): void 

  ////
}