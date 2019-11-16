import {
  ShaderGraph, Observable, ShaderUniformInputNode, ShaderTextureNode,
  ArrayFlattenable, uniformUploadType, Nullable, UBOProvider, ShaderGraphUniformProvider
} from "../..";

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

export interface UniformGroup{
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
export interface ShaderUniformProvider extends UBOProvider, ShaderGraphUniformProvider{
  shouldProxyedByUBO: boolean;
  uploadCache: ProviderUploadCache;
}
