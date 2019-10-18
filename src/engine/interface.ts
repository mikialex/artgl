import { RenderEngine } from "./render-engine";
import { Geometry } from "../core/geometry";
import { Material } from "../core/material";
import { Nullable } from "../type";
import { Shading } from "../core/shading";
import { RenderRange } from "../core/render-object";
import { Vector4Like } from "../math/interface";

export interface Renderable {
  render(engine: RenderEngine): void;
}

export interface IRenderEngine {

  //// render APIs
  render(anything: Renderable): void;

  //// resource binding
  useGeometry(geometry: Geometry): void;
  useMaterial(material: Material): void;
  useShading(shading: Nullable<Shading>): void;
  useRange(geometry: Geometry, range?: RenderRange): void;

  //// viewport
  setViewport(x: number, y: number, width: number, height: number): void 
  setFullScreenViewPort(): void 

  ////
  setClearColor(color: Vector4Like): void;
  getClearColor(): Vector4Like;
  clearColor(): void;

  clearDepth(): void;


}