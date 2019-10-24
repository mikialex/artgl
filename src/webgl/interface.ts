import { GLDataType } from "../core/data-type";

export enum GLTextureType{
  texture2D,
  textureCube,
}

export interface TextureDescriptor {
  name: string,
  type: GLTextureType,
}

export type uniformUploadType = number | Float32Array | number[]
export type flattenerType = (value: any, receiveData?: uniformUploadType) => uniformUploadType;
export type setterType = (gl: WebGLRenderingContext, location: WebGLUniformLocation, data: uniformUploadType) => void
export type copierType = (newValue: uniformUploadType, target: uniformUploadType) => uniformUploadType;
export type differType = (newValue: uniformUploadType, oldValue: uniformUploadType) => boolean;

export interface UniformDescriptor {
  name: string,
  type: GLDataType,
  default?: any,
  flattener?: flattenerType
  setter?: setterType,
  copier?: copierType,
  differ?: differType
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