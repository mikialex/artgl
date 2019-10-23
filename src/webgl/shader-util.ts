import { GLProgramConfig } from "./program";
import { GLTextureType } from "./uniform/uniform-texture";
import { GLDataType2ShaderString, GLDataToShaderString } from "../core/data-type";
import { ShaderUniformProvider } from "../artgl";

export function injectVertexShaderHeaders(
  config: GLProgramConfig,
  shaderText: string,
  isWebGL2: boolean
) {
  let injectText = '';
  if (isWebGL2) {
    injectText += '#version 300 es\n'
  }
  injectText += generateAttributeString(config, isWebGL2);
  injectText += generateUniformString(config);
  injectText += generateVaryingString(config, isWebGL2, false);
  return injectText + shaderText;
}

export function injectFragmentShaderHeaders(
  config: GLProgramConfig,
  shaderText: string,
  isWebGL2: boolean
) {
  let injectText = '';
  if (isWebGL2) {
    injectText += '#version 300 es\n'
  }
  if (config.needDerivative === true && !isWebGL2) {
    injectText += '#extension GL_OES_standard_derivatives : enable\n';
  }
  injectText += 'precision highp float;\n';
  injectText += generateUniformString(config);
  injectText += generateVaryingString(config, isWebGL2, true);
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
      const typeStr = getTypeStringFromTextureType(texture.type);
      text = text + 'uniform ' + typeStr + ' ' + texture.name + ';\n';
    })
  }
  return text;
}

function generateAttributeString(config: GLProgramConfig, isWebGL2: boolean): string {
  let text = '';
  if (config.attributes !== undefined) {
    config.attributes.forEach(att => {
      const typeStr = GLDataType2ShaderString(att.type);
      if (isWebGL2) {
        text = text + 'in ' + typeStr + ' ' + att.name + ';\n';
      } else {
        text = text + 'attribute ' + typeStr + ' ' + att.name + ';\n';
      }
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

function generateVaryingString(
  config: GLProgramConfig,
  isWebGL2: boolean,
  inFragmentShader: boolean
): string {
  let text = '';
  if (config.varyings !== undefined) {
    config.varyings.forEach(vary => {
      const typeStr = GLDataType2ShaderString(vary.type);
      if (isWebGL2) {
        if (inFragmentShader) {
          text = text + 'in ' + typeStr + ' ' + vary.name + ';\n';
        } else {
          text = text + 'out ' + typeStr + ' ' + vary.name + ';\n';
        }
      } else {
        text = text + 'varying ' + typeStr + ' ' + vary.name + ';\n';
      }
    })
  }
  return text;
}

export function getShaderUniformProviderUBOKey(provider: ShaderUniformProvider) {
  return provider.uuid + provider.constructor.name;
}

export function generateUBOLayoutForShaderUniformProvider(provider: ShaderUniformProvider) {
  let contentStr = "";
  provider.uniforms.forEach((value, key) => {
    const uniformName = provider.propertyUniformNameMap.get(key);
    contentStr += `  ${GLDataToShaderString(value)} ${uniformName};\n`;
  })

  const layoutStr =
    `
layout (std140) uniform ${getShaderUniformProviderUBOKey(provider)}
{
${contentStr}
};
`;
  return layoutStr;
}