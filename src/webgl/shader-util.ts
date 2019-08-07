import { GLProgramConfig } from "./program";
import { Matrix4, Vector3 } from "../math/index";
import { Vector2 } from "../math/vector2";
import { Vector4 } from "../math/vector4";

export type GLData = number | Matrix4;

export type float = number;
// export type floatVec2 = Vector2;
export type floatVec3 = Vector3;
// export type floatVec4 = Vector4;
export type int = number;

export const enum GLDataType{
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
  sampler2D
}

const shaderStringMap: { [index: string]: GLDataType } = {
  'float': GLDataType.float,
  'vec2': GLDataType.floatVec2,
  'vec3': GLDataType.floatVec3,
  'vec4': GLDataType.floatVec4,
  'mat2': GLDataType.Mat2,
  'mat3': GLDataType.Mat3,
  'mat4': GLDataType.Mat4,
  'sampler2D': GLDataType.sampler2D
}
let reverseShaderStringMap: { [index: number]: string } = {};
Object.keys(shaderStringMap).forEach(key => {
  reverseShaderStringMap[shaderStringMap[key]] = key
})

const shaderAttributeStringInfo: { [index: string]: { type: GLDataType, stride: number, default: any} } = {
  'float': { type: GLDataType.float, stride: 1, default: 0 },
  'vec2': { type: GLDataType.floatVec2, stride: 2, default: new Vector2() },
  'vec3': { type: GLDataType.floatVec3, stride: 3, default: new Vector3() },
  'vec4': { type: GLDataType.floatVec4, stride: 4, default: new Vector4() },
}
let reverseShaderAttributeStringInfo: { [index: number]: { name: string, stride: number , default: any} } = {};
Object.keys(shaderAttributeStringInfo).forEach(key => {
  reverseShaderAttributeStringInfo[shaderAttributeStringInfo[key].type] =
    { name: key, stride: shaderAttributeStringInfo[key].stride , default: shaderAttributeStringInfo[key].default}
})

export function getShaderTypeStringFromGLDataType(type: GLDataType) {
  return reverseShaderStringMap[type];
}

export function getGLDataTypeStride(type: GLDataType) {
  return reverseShaderAttributeStringInfo[type].stride;
}

export function getGLDataTypeDefaultDefaultValue(type: GLDataType) {
  const value = reverseShaderAttributeStringInfo[type].default;
  try {
    const clonedValue = value.clone();
    return clonedValue;
  } catch (error) {
    return value
  }
}

function AttributeGLDataType2ShaderString(type: GLDataType) {
  return reverseShaderAttributeStringInfo[type].name;
}



export function injectVertexShaderHeaders(config: GLProgramConfig, shaderText: string) {
  let injectText = '';
  injectText += generateAttributeString(config);
  injectText += generateUniformString(config);
  injectText += generateVaryingString(config);
  return injectText + shaderText;
}

export function injectFragmentShaderHeaders(config: GLProgramConfig, shaderText: string) {
  let injectText = '';
  injectText += 'precision highp float;\n';
  injectText += generateUniformString(config);
  injectText += generateVaryingString(config);
  injectText += generateTextureString(config);
  return injectText + shaderText;
}

function generateTextureString(config: GLProgramConfig): string {
  let text = '';
  if (config.textures !== undefined) {
    config.textures.forEach(texture => {
      text = text + 'uniform sampler2D' + ' ' + texture.name + ';\n';
    })
  }
  return text;
}

function generateAttributeString(config: GLProgramConfig): string {
  let text = '';
  if (config.attributes !== undefined) {
    config.attributes.forEach(att => {
      const type = AttributeGLDataType2ShaderString(att.type);
      text = text + 'attribute ' + type + ' ' + att.name + ';\n';
    })
  }
  return text;
}

function generateUniformString(config: GLProgramConfig): string {
  let text = '';
  if (config.uniforms !== undefined) {

    for (const key in config.uniforms) {
      const uni = config.uniforms[key];
      const type = getShaderTypeStringFromGLDataType(uni.type);
      text = text + 'uniform ' + type + ' ' + uni.name + ';\n';
    }
  }
  return text;
}

function generateVaryingString(config: GLProgramConfig): string {
  let text = '';
  if (config.varyings !== undefined) {
    config.varyings.forEach(vary => {
      const type = getShaderTypeStringFromGLDataType(vary.type);
      text = text + 'varying ' + type + ' ' + vary.name + ';\n';
    })
  }
  return text;
}