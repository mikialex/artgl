import { GLDataType } from "../webgl/shader-util";
import { ShaderGraphNodeDefine } from "./shader-graph";
import { ShaderFunctionNode } from "./shader-node";

export interface ShaderFunctionInput{
  name: string
  type: GLDataType,
}

export interface ShaderFunctionDefine{
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
    this.define = define;
  }

  define: ShaderFunctionDefine

  createNode(define: ShaderGraphNodeDefine): ShaderFunctionNode {
    const node = new ShaderFunctionNode(define);
    node.factory = this;
    return node;
  }

}
