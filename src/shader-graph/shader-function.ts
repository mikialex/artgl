import { ShaderFunctionNode } from "./shader-node";
import { parseShaderFunctionMetaInfo } from "./parser/shader-function-meta";
import { CodeBuilder } from "./util/code-builder";
import { GLDataType, GLDataType2ShaderString } from "../core/data-type";

export interface ShaderFunctionDefine {
  source: string,
  description?: string;
  needDerivative?: boolean;
  dependFunction?: ShaderFunction[];
}

export interface ShaderFunctionParsedDefine {
  name: string;
  description?: string;
  source: string;
  inputs: { [index: string]: GLDataType };
  returnType: GLDataType
}


const functionNamesRecord: { [index: string]: number } = {};

export function shader(source: string) {
  return new ShaderFunction({
    source
  })
}

/**
 *  Define a shader function node factory
 *  that with depend some input 
 *  and output
 */
export class ShaderFunction {
  constructor(define: ShaderFunctionDefine) {

    this.define = parseShaderFunctionMetaInfo(define);

    this.needDerivative = define.needDerivative === true

    this.name = this.define.name;
    const record = functionNamesRecord[this.define.name];
    if (record !== undefined) {
      functionNamesRecord[this.define.name] = record + 1;
      this.define.name = this.define.name + record
    } else {
      functionNamesRecord[this.define.name] = 1;
    }

    if (define.dependFunction !== undefined) {
      this.dependShaderFunction = define.dependFunction
    }
  }

  readonly name: string;
  readonly define: ShaderFunctionParsedDefine
  readonly needDerivative: boolean;

  dependShaderFunction: ShaderFunction[] = [];

  make(): ShaderFunctionNode {
    const node = new ShaderFunctionNode(this);
    return node;
  }

  genShaderFunctionIncludeCode(resolvedFunction: Set<ShaderFunction>, isWebGL2: boolean)
    : { result: string, needDerivative: boolean } {
    let needDerivative = this.needDerivative;

    const builder = new CodeBuilder()

    this.dependShaderFunction.forEach(func => {
      if (!resolvedFunction.has(func)) {
        const result = func.genShaderFunctionIncludeCode(resolvedFunction, isWebGL2);
        builder.writeBlock(result.result);
        needDerivative = needDerivative || result.needDerivative;
        resolvedFunction.add(func)
      }
    })
    resolvedFunction.add(this)

    const define = this.define;
    const varType = GLDataType2ShaderString(define.returnType);
    let functionInputs = "";
    const keys = Object.keys(define.inputs)
    keys.forEach((key, index) => {
      const paramType = GLDataType2ShaderString(define.inputs[key]);
      const paramStr = `${paramType} ${key}`
      functionInputs += paramStr
      if (index !== keys.length - 1) {
        functionInputs += ", "
      }
    })

    if (define.description !== undefined) {
      builder.writeCommentBlock(define.description)
    }

    builder.writeLine(`${varType} ${define.name}(${functionInputs}){`)
    builder.addIndent()
    builder.writeBlock(this.convertSource(define.source, isWebGL2))
    builder.reduceIndent()
    builder.writeLine("}")
    return { result: builder.output(), needDerivative };
  }

  private convertSource(src: string, isWebGL2: boolean) {
    let source = src.slice();
    
  // func name maybe not same as func.define.name because function name auto deduplicate
  // TODO maybe need check cycle depend
    this.dependShaderFunction.forEach(func => {
      if (func.name.trim() !== func.define.name.trim()) {
        replaceFunctionCallByName(source, func.name, func.define.name)
      }
    })

    if (isWebGL2) {
      source = replaceFunctionCallByName(source, 'texture2D', 'texture')
      source = replaceFunctionCallByName(source, 'textureCube', 'texture')
    }

    return source;
  }

}

// todo this maybe have better impl, that really check is function name
function replaceFunctionCallByName(source: string, functionName: string, replaceName: string) {
  return source.split(functionName).join(replaceName)
}