import { ShaderFunctionDefine, ShaderFunctionParsedDefine } from "../shader-function";
import { getDataTypeFromShaderString, GLDataType } from "../../core/data-type";

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

export function getOneParam(input: string) {
  const split = input.trim().split(' ').filter(char => char !== "");
  return {
    name: split[1].trim(),
    type: getDataTypeFromShaderString(split[0])
  }
}

export function getParamList(input: string) {
  const para = input.trim();
  if (para[para.length - 1] !== ')' || para[0] !== '(') {
    throw 'err'
  }

  const unbrace = para.substring(1, para.length - 1)

  const split = unbrace.split(',').filter(char => char.trim() !== "");
  const result: {[index: string]: GLDataType} = {};
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
    returnType: getDataTypeFromShaderString(split[0].trim())
  }

}