import { GLProgramConfig } from "./program";
import { Matrix4 } from "../math";

export type GLData = number | Matrix4 

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
  Mat4
}

const shaderStringMap: { [index: string]: GLDataType } = {
  'float': GLDataType.float,
  'vec2': GLDataType.floatVec2,
  'vec3': GLDataType.floatVec3,
  'vec4': GLDataType.floatVec4,
  'mat2': GLDataType.Mat2,
  'mat3': GLDataType.Mat3,
  'mat4': GLDataType.Mat4,
}
let reverseShaderStringMap: { [index: number]: string } = {};
Object.keys(shaderStringMap).forEach(key => {
  reverseShaderStringMap[shaderStringMap[key]] = key
})

const shaderAttributStringInfo: { [index: string]: { type: GLDataType, stride: number} } = {
  'float': { type: GLDataType.float, stride: 1 },
  'vec2': { type: GLDataType.floatVec2, stride: 2 },
  'vec3': { type: GLDataType.floatVec3, stride: 3 },
  'vec4': { type: GLDataType.floatVec4, stride: 4 },
}
let reverseShaderAttributStringInfo: { [index: number]: { name: string, stride: number } } = {};
Object.keys(shaderAttributStringInfo).forEach(key => {
  reverseShaderAttributStringInfo[shaderAttributStringInfo[key].type] =
    { name: key, stride: shaderAttributStringInfo[key].stride }
})

function GLDataType2ShaderString(type: GLDataType) {
  return reverseShaderStringMap[type];
}

function getAttributeStride(type: GLDataType) {
  return reverseShaderAttributStringInfo[type].stride;
}

function AttrivbuteGLDataType2ShaderString(type: GLDataType) {
  return reverseShaderAttributStringInfo[type].name;
}



export function injectVertexShaderHeaders(config: GLProgramConfig, shaderText: string) {
  let injectText = '';
  injectText += generateAttributeString(config);
  injectText += generateUnifromString(config);
  injectText += generateVaryingString(config);
  return injectText + shaderText;
}

export function injectFragmentShaderHeaders(config: GLProgramConfig, shaderText: string) {
  let injectText = '';
  injectText += 'precision highp float;\n';
  injectText = injectText + generateUnifromString(config);
  injectText = injectText + generateVaryingString(config);
  return injectText + shaderText;
}


function generateAttributeString(config: GLProgramConfig) {
  let text = '';
  if (config.attributes !== undefined) {
    config.attributes.forEach(att => {
      att.stride = getAttributeStride(att.type);
      const type = AttrivbuteGLDataType2ShaderString(att.type);
      text = text + 'attribute ' + type + ' ' + att.name + ';\n';
    })
  }
  return text;
}

function generateUnifromString(config: GLProgramConfig) {
  let text = '';
  if (config.uniforms !== undefined) {
    config.uniforms.forEach(uni => {
      const type = GLDataType2ShaderString(uni.type);
      text = text + 'uniform ' + type + ' ' + uni.name + ';\n';
    })
  }
  return text;
}

function generateVaryingString(config: GLProgramConfig) {
  let text = '';
  if (config.varyings !== undefined) {
    config.varyings.forEach(vary => {
      const type = GLDataType2ShaderString(vary.type);
      text = text + 'varying ' + type + ' ' + vary.name + ';\n';
    })
  }
  return text;
}