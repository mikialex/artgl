import { ShaderFunctionDefine, ShaderFunctionParsedDefine } from "../shader-function";
import { GLDataType } from "../../webgl/shader-util";

export function parseShaderFunctionMetaInfo(input: ShaderFunctionDefine)
  : ShaderFunctionParsedDefine {
  try {
    const [head, body] = splitStrUntilChar(input.source, '{')
    const [funcHead, funcParam] = splitStrUntilChar(head, '(')
    const { name, returnType } = getFuncHead(funcHead)
    const inputs = getParamList(funcParam)
    const source = getFuncBody(body)
    return {
      name,
      description: input.description,
      source,
      inputs,
      returnType,
    }
  } catch (error) {
    throw "shader function parsed error"
  }
}

export function splitStrUntilChar(str: string, char: string) {
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === char) {
      return [str.substr(0, i), str.substr(i)];
    }
  }
  throw "split error"
}

export function getDataType(input: string): GLDataType {
  switch (input.trim()) {
    case "float": return GLDataType.float
    case "vec2": return GLDataType.floatVec2
    case "vec3": return GLDataType.floatVec3
    case "vec4": return GLDataType.floatVec4
    case "mat2": return GLDataType.Mat2
    case "mat3": return GLDataType.Mat3
    case "mat4": return GLDataType.Mat4
    case "sampler2D": return GLDataType.sampler2D

    default: throw 'parse error'
  }
}

export function getOneParam(input: string) {
  const split = input.trim().split(' ').filter(char => char !== "");
  return {
    name: split[1].trim(),
    type: getDataType(split[0])
  }
}

export function getParamList(input: string) {
  const para = input.trim();
  if (para[para.length - 1] !== ')' || para[0] !== '(') {
    throw 'err'
  }

  const unbrace = para.substring(1, para.length - 1)

  const split = unbrace.split(',').filter(char => char.trim() !== "");
  const result = {};
  split.forEach(item => {
    const { name, type } = getOneParam(item)
    result[name] = type
  })
  return result;
}


export function getFuncBody(input: string) {
  const para = input.trim();
  if (para[para.length - 1] !== '}' || para[0] !== '{') {
    throw 'err'
  }
  return para.substring(1, para.length - 1);
}

function getFuncHead(input: string) {
  const split = input.split(' ').filter(char => char.trim() !== "");
  return {
    name: split[1].trim(),
    returnType: getDataType(split[0])
  }

}