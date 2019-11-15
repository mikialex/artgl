import { Vector2, Vector3, Vector4, Matrix4, ArrayFlattenable, Matrix3 } from "@artgl/math";
import { Texture, CubeTexture } from "../artgl";
import { GLDataType } from "@artgl/webgl";

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

export function getGLDataTypeDefaultDefaultValue(type: GLDataType) {
  switch (type) {
    case GLDataType.float: return 1
    case GLDataType.floatVec2: return new Vector2()
    case GLDataType.floatVec3: return new Vector3()
    case GLDataType.floatVec4: return new Vector4()
    case GLDataType.Mat3: return new Matrix3()
    case GLDataType.Mat4: return new Matrix4()
    default: throw 'unsupported'
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