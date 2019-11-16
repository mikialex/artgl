import {
  ShaderGraph, Observable, ShaderUniformInputNode, ShaderTextureNode,
  ArrayFlattenable, uniformUploadType, Nullable, UBOProvider, ShaderGraphUniformProvider,
  RenderEngine, WebGLAttributeBuffersProvider, Geometry, Material, Shading, RenderRange, Vector4Like
} from "../..";

export interface GeometryWebGLDataProvider extends WebGLAttributeBuffersProvider{
  needIndexUint32(): boolean;
  getIndexAttributeWebGLBuffer(engine: RenderEngine): WebGLBuffer;
  getAttributeWebGLBuffer(engine: RenderEngine, attributeName: string): WebGLBuffer;
}

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


export interface Size {
  width: number;
  height: number;
}

export interface GraphicResourceReleasable {
  releaseGraphics(engine: RenderEngine): void;
}


export interface ShaderUniformDecorator {
  /**
  * impl this to decorate your shader source, add uniform input
  */
  decorate(graph: ShaderGraph): void;

  /**
   * one UniformProvider can have others provider depends and inject, visit them all
   */
  foreachProvider(visitor: (p: ShaderUniformProvider) => any): void;

  notifyNeedRedecorate: Observable<ShaderUniformDecorator>;
  nodeCreated: Map<string, ShaderUniformInputNode>;
  textureNodeCreated: Map<string, ShaderTextureNode>;
}

export interface UniformGroup {
  value: ArrayFlattenable | number,
  uploadCache: uniformUploadType,
  isUploadCacheDirty: boolean,
  blockedBufferStartIndex: number,
  uniformName: uniformName
}

export interface ProviderUploadCache {
  blockedBuffer: Nullable<Float32Array>;
  uniforms: Map<propertyName, UniformGroup>;
  blockedBufferNeedUpdate: boolean;
  _version: number;
}

type propertyName = string;
type uniformName = string;
export interface ShaderUniformProvider extends UBOProvider, ShaderGraphUniformProvider {
  shouldProxyedByUBO: boolean;
  uploadCache: ProviderUploadCache;
}
