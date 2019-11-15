import { Nullable } from "@artgl/shared";

export interface Vector4Like{
  x: number, y: number, z: number, w: number
}

export interface FBOProvider {
  name: string
  getFormatKey(): string
}

// export interface RenderSourceForGraph {
//   render(engine: RenderGraphBackEnd): void;
// }

// export interface QuadSourceForGraph extends RenderSourceForGraph{}

export type RenderMethod = Function;

export interface ShadingHandle {}

export interface RenderGraphBackEnd {
  //// viewport
  setViewport(x: number, y: number, width: number, height: number): void 
  setFullScreenViewPort(): void 

  ////
  setClearColor(color: Vector4Like): void;
  getClearColor(color: Vector4Like): Vector4Like;
  clearColor(): void;

  clearDepth(): void;

  createFramebuffer(name: string, width: number, height: number, enableDepth: boolean): FBOProvider;
  deleteFramebuffer(fbo: FBOProvider): void;
  getFramebuffer(name: string): FBOProvider | undefined;

  setRenderTarget(fbo: FBOProvider): void;
  setRenderTargetScreen(): void;

  setOverrideShading(shading: Nullable<ShadingHandle>): void;

  renderFrameBuffer(fbo: FBOProvider, viewport: Vector4Like): void;
}