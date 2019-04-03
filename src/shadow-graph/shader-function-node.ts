import { GLDataType } from "../webgl/shader-util";
import { DAGNode } from "../render-graph/dag/dag-node";

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

  createNode(): ShaderFunctionNode {
    return new ShaderFunctionNode();
  }

}


export class ShaderFunctionNode extends DAGNode{

  // create a fragmentshader from this node
  makeFragmentShader() {
    
  }

  fillInput(key:string, input) {
    
  }
}

// this should be more simple by use a glsl parser
const depthPackFunction = new ShaderFunction({
  name: 'depthPack',
  description: 'pack depth to RGBA output',
  source: `
    vec4 bitSh = vec4(256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0);
    vec4 bitMsk = vec4(0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0);
    vec4 enc = fract(frag_depth * bitSh);
    enc -= enc.xxyz * bitMsk;
    return enc;
  `,
  inputs: [
    {
      name: "frag_depth",
      type: GLDataType.float
    }
  ],
  returnType: GLDataType.floatVec4
})

const depthPackNode = depthPackFunction.createNode();
depthPackNode.fillInput("frag_depth", 1)

depthPackNode.makeFragmentShader();

