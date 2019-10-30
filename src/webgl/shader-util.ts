import { GLDataType2ShaderString } from "../core/data-type";
import { GLProgramConfig, GLTextureType, UniformBlockDescriptor } from "./interface";

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
  injectText += generateUBOString(config, isWebGL2);
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
  injectText += generateUBOString(config, isWebGL2);
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
    config.uniforms.forEach(uni => {
      const typeStr = GLDataType2ShaderString(uni.type);
      text = text + 'uniform ' + typeStr + ' ' + uni.name + ';\n';
    })
  }
  return text;
}

function generateUBOString(config: GLProgramConfig, isWebGL2: boolean): string {
  if (!isWebGL2) {
    throw 'ubo is ony support in webgl2'
  }
  let text = '';
  if (config.uniformBlocks !== undefined) {
    config.uniformBlocks.forEach(ub => {
      text += generateOneUBOString(ub);
    })
  }
  return text;
}

function generateOneUBOString(des: UniformBlockDescriptor) {
  let contentStr = "";
  des.uniforms.forEach(uni => {
    contentStr += `  ${GLDataType2ShaderString(uni.type)} ${uni.name};\n`;
  })

  const layoutStr =
    `
layout (std140) uniform ${des.name}
{
${contentStr}
};

`;
  return layoutStr;
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
