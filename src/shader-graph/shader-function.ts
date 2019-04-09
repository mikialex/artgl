import { GLDataType } from "../webgl/shader-util";
import { DAGNode } from "../render-graph/dag/dag-node";
import { ShaderGraphNodeDefine } from "./shader-graph";

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
    return node;
  }

}


/**
 * A node instance of a shaderfunction
 * used in shadergraph for connection
 *
 * @export
 * @class ShaderFunctionNode
 * @extends {DAGNode}
 */
export class ShaderFunctionNode extends DAGNode{
  constructor(define: ShaderGraphNodeDefine) {
    super();
    this.define = define;
  }

  name: string;
  define: ShaderGraphNodeDefine;

  // create a fragmentshader from this node
  makeFragmentShader() {
    
  }

  fillInput(key:string, input) {
    
  }
}
