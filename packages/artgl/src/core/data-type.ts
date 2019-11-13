import { Vector2, Vector3, Vector4, Matrix4, ArrayFlattenable } from "../math";
import { Texture, CubeTexture } from "../artgl";

export type GLData = number | Vector2 | Vector3 | Vector4 | Matrix4;

export function GLDataToShaderString(value: GLData): string {
  if (typeof value === "number") {
    return "float"
  } else if (value instanceof Vector2) {
    return "vec2"
  } else if (value instanceof Vector3) {
    return "vec3"
  } else if (value instanceof Vector4) {
    return "vec4"
  } else if (value instanceof Matrix4) {
    return "mat4"
  }
  throw 'unknown'
}

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
  'mat4': { type: GLDataType.Mat4, stride: 16, default: new Matrix4() },
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

export function valueToGLType(value: ArrayFlattenable | number) {
  if (typeof value === "number") {
    return GLDataType.float;
  } else if (value instanceof Vector2) {
    return GLDataType.floatVec2
  } else if (value instanceof Vector3) {
    return GLDataType.floatVec3
  } else if (value instanceof Vector4) {
    return GLDataType.floatVec4
  } else if (value instanceof Matrix4) {
    return GLDataType.Mat4
  } else {
    throw "unsupported value"
  }
}

export function valueToFlatted(value: ArrayFlattenable | number) {
  if (typeof value === 'number') {
    return value;
  } else {
    return value.toArray();
  }
}