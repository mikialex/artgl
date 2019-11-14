import { GLRenderer } from "./gl-renderer";
import { GLDataType } from "./data-type";

export interface UBOProvider {
  getBlockedBuffer(): Float32Array
  getBlockedBufferVersion(): number
}

export interface ShadingProvider {
  getVersion(): number
  getProgramConfig(isWebGL2: boolean, useUBO:boolean): GLProgramConfig
}

export interface WebGLTextureProvider {
  getVersion(): number;
}

export interface WebGLCommonTextureProvider extends WebGLTextureProvider {
}

export interface WebGLCubeTextureProvider extends WebGLTextureProvider {

}

export interface WebGLAttributeBuffersProvider {
  getVersion(): number
}

export interface GLReleasable {
  releaseGL(renderer: GLRenderer): void;
}

export enum GLTextureType{
  texture2D,
  textureCube,
}

export interface TextureDescriptor {
  name: string,
  type: GLTextureType,
}

export type uniformUploadType = number | Float32Array | number[]

export interface UniformDescriptor {
  name: string,
  type: GLDataType,
  default?: uniformUploadType
}

export interface VaryingDescriptor {
  name: string,
  type: GLDataType
}

export interface UniformBlockDescriptor{
  name: string,
  uniforms: UniformDescriptor[]
}

export const enum CommonAttribute {
  position = 'position',
  normal = 'normal',
  color = 'color',
  uv = 'uv',
  baryCentric = 'baryCentric'
}

export interface AttributeDescriptor {
  name: string,
  type: GLDataType,
  asInstance?: boolean, // default false
  instanceDivisor?: number // default 1
}

export interface GLProgramConfig {
  attributes: AttributeDescriptor[];
  uniforms?: UniformDescriptor[];
  varyings?: VaryingDescriptor[];
  textures?: TextureDescriptor[];
  vertexShaderString: string;
  fragmentShaderString: string;
  useIndex?: boolean;
  needDerivative?: boolean;
  uniformBlocks?: UniformBlockDescriptor[];
}