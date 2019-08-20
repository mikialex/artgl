import { Observable } from "../core/observable";
import { Size, RenderSource } from "../engine/render-engine";
import { Vector4Like } from "../math/interface";

export interface NamedAndFormatKeyed {
  name: string,
  getFormatKey(): string
}

export interface ShadingDetermined<ShadingType> {
  shading: ShadingType
}

export interface RenderGraphBackendAdaptor<
  ShadingType,
  RenderableType extends ShadingDetermined<ShadingType>,
  FBOType extends NamedAndFormatKeyed
  > {
  resizeObservable: Observable<Size>

  renderObject(object: RenderableType): void;
  render(source: RenderSource): void;
  renderFrameBuffer(framebuffer: FBOType, viewport: Vector4Like): void;

  setOverrideShading(shading: ShadingType): void;
  
  createFramebuffer(key: string, width: number, height: number, hasDepth: boolean): FBOType;
  getFramebuffer(key: string): FBOType;
  deleteFramebuffer(fbo: FBOType): void;

  setRenderTargetScreen(): void;
  setRenderTarget(framebuffer: FBOType): void;

  renderBufferWidth(): number;
  renderBufferHeight(): number;

  setViewport(x: number, y: number, width: number, height: number): void;
  setFullScreenViewPort(): void;
  setClearColor(color: Vector4Like): void;
  getClearColor(): Vector4Like;
  clearColor(): void;
  clearDepth(): void;
}