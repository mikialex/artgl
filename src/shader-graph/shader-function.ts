import { GLDataType } from "../webgl/shader-util";
import { ShaderGraphNodeDefine } from "./shader-graph";
import { ShaderFunctionNode } from "./shader-node";
import { parseShaderFunctionMetaInfo } from "./parser/shader-function-meta";

export interface ShaderFunctionDefine {
  source: string, 
  description?: string;
}

export interface ShaderFunctionInput{
  name: string
  type: GLDataType,
}

export interface ShaderFunctionParsedDefine{
  name: string;
  description?: string;
  source: string;
  inputs: ShaderFunctionInput[];
  returnType: GLDataType
}


export enum GLFragmentInnerVar{
  
}


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
  }

  define: ShaderFunctionParsedDefine

  createNode(define: ShaderGraphNodeDefine): ShaderFunctionNode {
    const node = new ShaderFunctionNode(define, this.define);
    node.factory = this;
    return node;
  }

}
