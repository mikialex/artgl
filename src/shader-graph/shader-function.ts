import { GLDataType, getShaderTypeStringFromGLDataType } from "../webgl/shader-util";
import { ShaderFunctionNode } from "./shader-node";
import { parseShaderFunctionMetaInfo } from "./parser/shader-function-meta";
import { CodeBuilder } from "./util/code-builder";

export interface ShaderFunctionDefine {
  source: string, 
  description?: string;
  dependFunction?: ShaderFunction[];
}

export interface ShaderFunctionParsedDefine{
  name: string;
  description?: string;
  source: string;
  inputs: { [index: string]: GLDataType };
  returnType: GLDataType
}


const functionNamesRecord = {};

/**
 *  Define a shader function node factory
 *  that with depend some input 
 *  and output
 * @export
 * @class ShaderFunction
 */
export class ShaderFunction{
  constructor(define: ShaderFunctionDefine) {

    this.define = parseShaderFunctionMetaInfo(define);

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

  dependShaderFunction: ShaderFunction[] = [];

  make(): ShaderFunctionNode {
    const node = new ShaderFunctionNode(this);
    return node;
  }

  genShaderFunctionIncludeCode(resolvedFunction: Set<ShaderFunction>): string {
    const builder = new CodeBuilder()
    builder.reset();

    this.dependShaderFunction.forEach(func => {
      if (!resolvedFunction.has(func)) {
        builder.writeBlock(func.genShaderFunctionIncludeCode(resolvedFunction));
        resolvedFunction.add(func)
      }
    })
    resolvedFunction.add(this)

    const define = this.define;
    const varType = getShaderTypeStringFromGLDataType(define.returnType);
    let functionInputs = "";
    const keys = Object.keys(define.inputs)
    keys.forEach((key, index) => {
      const paramType = getShaderTypeStringFromGLDataType(define.inputs[key]);
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
    return builder.output();
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