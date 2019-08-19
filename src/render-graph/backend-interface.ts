import { Observable } from "../core/observable";
import { Size, RenderSource } from "../engine/render-engine";

export interface Vector4Like{
  x: number, y: number, z: number, w: number,
  equals(other: Vector4Like): boolean,
}

export interface RenderGraphBackendAdaptor{
  resizeObservable: Observable<Size>

  render(object): void;
  renderSource(source: RenderSource): void;
  renderFrameBuffer(framebuffer): void;
  
}