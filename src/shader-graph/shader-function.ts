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

  genShaderFunctionIncludeCode(resolvedFunction: Set<ShaderFunction>)
    : { result: string, needDerivative: boolean } {
    let needDerivative = this.needDerivative;

    const builder = new CodeBuilder()
    builder.reset();

    this.dependShaderFunction.forEach(func => {
      if (!resolvedFunction.has(func)) {
        const result = func.genShaderFunctionIncludeCode(resolvedFunction);
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
    builder.writeBlock(this.replaceFunctionCalls(define.source))
    builder.reduceIndent()
    builder.writeLine("}")
    return { result: builder.output(), needDerivative };
  }

  // TODO maybe need check cycle depend
  private replaceFunctionCalls(src: string) {
    let source = src.slice();
    this.dependShaderFunction.forEach(func => {
      if (func.name.trim() !== func.define.name.trim()) {
        replaceFunctionCallByName(source, func.name, func.define.name)
      }
    })
    return source;
  }

}

function replaceFunctionCallByName(source: string, functionName: string, replaceName: string) {
  return source.replace(new RegExp(functionName, 'g'), replaceName);
}