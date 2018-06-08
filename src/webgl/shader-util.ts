import { GLProgramConfig } from "./webgl-program";

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

export function injectVertexShaderHeaders(config: GLProgramConfig, shaderText: string) {
  let injectText = '';
  injectText += generateAttributeString(config);
  // injectText += generateUnifromString(config);
  injectText += generateVaryingString(config);
  return injectText + shaderText;
}

export function injectFragmentShaderHeaders(config: GLProgramConfig, shaderText: string) {
  let injectText = 'precision mediump float;\n';
  injectText = injectText + generateUnifromString(config);
  injectText = injectText + generateVaryingString(config);
  return injectText + shaderText;
}

function generateAttributeString(config: GLProgramConfig) {
  let text = '';
  if (config.attributes !== undefined) {
    config.attributes.forEach(att => {
      text = text + 'attribute vec4 ' + att.name + ';\n';
    })
  }
  return text;
}

function generateUnifromString(config: GLProgramConfig) {
  let text = '';
  if (config.uniforms !== undefined) {
    config.uniforms.forEach(uni => {
      let type;
      switch (uni.type) {
        case 'uniform1f':
          type = 'float'
          break;

        default:
          break;
      }
      text = text + 'uniform ' + type + ' ' + uni.name + ';\n';
    })
  }
  return text;
}

function generateVaryingString(config: GLProgramConfig) {
  let text = '';
  if (config.varyings !== undefined) {
    config.varyings.forEach(uni => {
      let type;
      switch (uni.type) {
        case 'vec4':
          type = 'vec4'
          break;

        default:
          break;
      }
      text = text + 'varying ' + type + ' ' + uni.name + ';\n';
    })
  }
  return text;
}