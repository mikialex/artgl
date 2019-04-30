import { GLDataType } from "../webgl/shader-util";
import { DAGNode } from "../render-graph/dag/dag-node";
import { ShaderGraphNodeDefine } from "./shader-graph";
import { InnerSupportUniform } from "../webgl/uniform/uniform";

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

export class ShaderNode extends DAGNode{
  name: string;
}


/**
 * A node instance of a shaderfunction
 * used in shadergraph for connection
 *
 * @export
 * @class ShaderFunctionNode
 * @extends {DAGNode}
 */
export class ShaderFunctionNode extends ShaderNode{
  constructor(define: ShaderGraphNodeDefine) {
    super();
    this.define = define;
  }

  define: ShaderGraphNodeDefine;
  factory: ShaderFunction

  // create a fragmentshader from this node
  makeFragmentShader() {
    
  }

  fillInput(key:string, input) {
    
  }
}


export const enum ShaderInputType {
  attribute,
  innerUniform,
  uniform,
  texture
}

export class ShaderInputNode extends ShaderNode {
  inputType: ShaderInputType;
  dataType: GLDataType;
}

export class ShaderInnerUniformInputNode extends ShaderInputNode {
  mapInner: InnerSupportUniform
}