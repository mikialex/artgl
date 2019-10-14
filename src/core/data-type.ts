import { Vector2, Vector3, Vector4, Matrix4 } from "../math";
import { Texture, CubeTexture } from "../artgl";

export type GLData = number | Vector2 | Vector3 | Vector4 | Matrix4;

export type GLTextureData = Texture | CubeTexture;

export const enum GLDataType {
  float,
  floatVec2,
  floatVec3,
  floatVec4,
  int,
  intVec2,
  intVec3,
  intVec4,
  Mat2,
  Mat3,
  Mat4,
  boolean,
  sampler2D,
  samplerCube
}

const shaderStringMap: { [index: string]: GLDataType } = {
  'float': GLDataType.float,
  'vec2': GLDataType.floatVec2,
  'vec3': GLDataType.floatVec3,
  'vec4': GLDataType.floatVec4,
  'mat2': GLDataType.Mat2,
  'mat3': GLDataType.Mat3,
  'mat4': GLDataType.Mat4,
  'sampler2D': GLDataType.sampler2D,
  'samplerCube': GLDataType.samplerCube
}

interface tableInfo {
  type: GLDataType,
  stride: number,
  default: any
}

const GLDataTypeInfo: { [index: string]: tableInfo } = {
  'float': { type: GLDataType.float, stride: 1, default: 0 },

  'vec2': { type: GLDataType.floatVec2, stride: 2, default: new Vector2() },
  'vec3': { type: GLDataType.floatVec3, stride: 3, default: new Vector3() },
  'vec4': { type: GLDataType.floatVec4, stride: 4, default: new Vector4() },

  // 'mat2': { type: GLDataType.Mat2, stride: 4, default: new Matrix2() }, // todo
  // 'mat3': { type: GLDataType.Mat3, stride: 9, default: new Matrix3() },
  'mat4': { type: GLDataType.Mat3, stride: 16, default: new Matrix4() },
  'sampler2D': { type: GLDataType.sampler2D, stride: 0, default: null },
  'samplerCube': { type: GLDataType.samplerCube, stride: 0, default: null },
}

let GLDataTypeInfoReverse: { [index: number]: { name: string, stride: number, default: any } } = {};
Object.keys(GLDataTypeInfo).forEach(key => {
  GLDataTypeInfoReverse[GLDataTypeInfo[key].type] =
    {
      name: key,
      stride: GLDataTypeInfo[key].stride,
      default: GLDataTypeInfo[key].default
    }
})

export function getGLDataTypeStride(type: GLDataType) {
  return GLDataTypeInfoReverse[type].stride;
}

export function GLDataType2ShaderString(type: GLDataType) {
  return GLDataTypeInfoReverse[type].name;
}


export function getDataTypeFromShaderString(str: string) {
  return GLDataTypeInfo[str].type;
}

export function getGLDataTypeDefaultDefaultValue(type: GLDataType) {
  const value = GLDataTypeInfoReverse[type].default;
  try {
    const clonedValue = value.clone();
    return clonedValue;
  } catch (error) {
    return value
  }
}