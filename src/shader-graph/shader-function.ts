import { GLDataType } from "../webgl/shader-util";
import { ShaderFunctionNode } from "./shader-node";
import { parseShaderFunctionMetaInfo } from "./parser/shader-function-meta";

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

  make(): ShaderFunctionNode {
    const node = new ShaderFunctionNode(this);
    return node;
  }

}
