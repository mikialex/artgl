import { Observable } from "../core/observable";
import { Size, RenderSource } from "../engine/render-engine";
import { Vector4Like } from "../math/interface";
import { Nullable } from "../type";

export interface ShadingConstrain {
  defineFBOInput(inputFramebufferName: string, uniformName: string): void;
}

export interface NamedAndFormatKeyed {
  name: string,
  getFormatKey(): string
}

export interface ShadingDetermined<ShadingType> {
  shading: ShadingType
}

export interface RenderGraphBackendAdaptor<
  ShadingType extends ShadingConstrain,
  RenderableType extends ShadingDetermined<ShadingType>,
  FBOType extends NamedAndFormatKeyed
  > {
  resizeObservable: Observable<Size>

  renderObject(object: RenderableType): void;
  render(source: RenderSource): void;
  renderFrameBuffer(framebuffer: FBOType, viewport: Vector4Like): void;

  setOverrideShading(shading: Nullable<ShadingType>): void;
  getOverrideShading(): Nullable<ShadingType>;
  
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
  resetDefaultClearColor(): void;
  clearColor(): void;
  clearDepth(): void;
}