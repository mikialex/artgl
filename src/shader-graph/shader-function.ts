import { GLDataType, getShaderTypeStringFromGLDataType } from "../webgl/shader-util";
import { ShaderFunctionNode } from "./shader-node";
import { parseShaderFunctionMetaInfo } from "./parser/shader-function-meta";
import { CodeBuilder } from "./util/code-builder";

export interface ShaderFunctionDefine {
  source: string, 
  description?: string;
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

    const record = functionNamesRecord[this.define.name];
    if (record !== undefined) {
      functionNamesRecord[this.define.name] = record + 1;
      this.define.name = this.define.name + record
    } else {
      functionNamesRecord[this.define.name] = 1;
    }

  }

  readonly define: ShaderFunctionParsedDefine

  make(): ShaderFunctionNode {
    const node = new ShaderFunctionNode(this);
    return node;
  }

  genShaderFunctionIncludeCode(): string {
    const builder = new CodeBuilder()
    builder.reset();
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
    builder.writeBlock(define.source)
    builder.reduceIndent()
    builder.writeLine("}")
    return builder.output();
  }

}
