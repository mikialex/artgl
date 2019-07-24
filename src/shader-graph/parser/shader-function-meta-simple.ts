import { ShaderFunctionDefine, ShaderFunctionParsedDefine } from "../shader-function";

export function parseShaderFunctionMetaInfo(input: ShaderFunctionDefine): ShaderFunctionParsedDefine {
  try {
    const s = input.source.trim() + "#"
    const result = functionp.parse(s).value
    const inputMap = {};
    result[2].forEach(item => {
      inputMap[item.name] = item.type;
    });
    return {
      name: result[1],
      description: input.description,
      source: result[3],
      inputs: inputMap,
      returnType: result[0],
    }
  } catch (error) {
    throw "shader function parsed error"
  }
}

function splitStrUntilChar(str: string, char: string) {
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (c === char) {
      return [str.substr(0, i), str.substr(i)];
    }
  }
  throw "split error"
}

function parseShaderFunctionSimple(source: string) {
  const [head, body] = splitStrUntilChar(source, '{');
  const [headStart, headEnd] = splitStrUntilChar(source, '(');
  // const 
}