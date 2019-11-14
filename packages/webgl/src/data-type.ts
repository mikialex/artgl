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
}

const GLDataTypeInfo: { [index: string]: tableInfo } = {
  'float': { type: GLDataType.float, stride: 1 },

  'vec2': { type: GLDataType.floatVec2, stride: 2 },
  'vec3': { type: GLDataType.floatVec3, stride: 3 },
  'vec4': { type: GLDataType.floatVec4, stride: 4 },

  // 'mat2': { type: GLDataType.Mat2, stride: 4, default: new Matrix2() }, // todo
  // 'mat3': { type: GLDataType.Mat3, stride: 9, default: new Matrix3() },
  'mat4': { type: GLDataType.Mat4, stride: 16 },
  'sampler2D': { type: GLDataType.sampler2D, stride: 0 },
  'samplerCube': { type: GLDataType.samplerCube, stride: 0 },
}

let GLDataTypeInfoReverse: { [index: number]: { name: string, stride: number } } = {};
Object.keys(GLDataTypeInfo).forEach(key => {
  GLDataTypeInfoReverse[GLDataTypeInfo[key].type] =
    {
      name: key,
      stride: GLDataTypeInfo[key].stride,
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
