import { GLProgramConfig } from "./program";
import { GLTextureType } from "./uniform/uniform-texture";
import { GLDataType2ShaderString } from "../core/data-type";

export function injectVertexShaderHeaders(config: GLProgramConfig, shaderText: string) {
  let injectText = '';
  injectText += generateAttributeString(config);
  injectText += generateUniformString(config);
  injectText += generateVaryingString(config);
  return injectText + shaderText;
}

export function injectFragmentShaderHeaders(config: GLProgramConfig, shaderText: string) {
  let injectText = '';
  if (config.needDerivative === true) {
    injectText += '#extension GL_OES_standard_derivatives : enable\n';
  }
  injectText += 'precision highp float;\n';
  injectText += generateUniformString(config);
  injectText += generateVaryingString(config);
  injectText += generateTextureString(config);
  return injectText + shaderText;
}

function getTypeStringFromTextureType(type: GLTextureType) {
  switch (type) {
    case GLTextureType.texture2D: return 'sampler2D'
    case GLTextureType.textureCube: return 'samplerCube'
    default: throw 'not find type'
  }
}

function generateTextureString(config: GLProgramConfig): string {
  let text = '';
  if (config.textures !== undefined) {
    config.textures.forEach(texture => {
      text = text + 'uniform ' + getTypeStringFromTextureType(texture.type) + ' ' + texture.name + ';\n';
    })
  }
  return text;
}

function generateAttributeString(config: GLProgramConfig): string {
  let text = '';
  if (config.attributes !== undefined) {
    config.attributes.forEach(att => {
      const typeStr = GLDataType2ShaderString(att.type);
      text = text + 'attribute ' + typeStr + ' ' + att.name + ';\n';
    })
  }
  return text;
}

function generateUniformString(config: GLProgramConfig): string {
  let text = '';
  if (config.uniforms !== undefined) {

    for (const key in config.uniforms) {
      const uni = config.uniforms[key];
      const typeStr = GLDataType2ShaderString(uni.type);
      text = text + 'uniform ' + typeStr + ' ' + uni.name + ';\n';
    }
  }
  return text;
}

function generateVaryingString(config: GLProgramConfig): string {
  let text = '';
  if (config.varyings !== undefined) {
    config.varyings.forEach(vary => {
      const typeStr = GLDataType2ShaderString(vary.type);
      text = text + 'varying ' + typeStr + ' ' + vary.name + ';\n';
    })
  }
  return text;
}