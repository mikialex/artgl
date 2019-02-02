import { GLDataType } from "../webgl/shader-util";

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


export class ShaderFunction{
  constructor(define: ShaderFunctionDefine) {
    this.define = define;
  }

  define: ShaderFunctionDefine

  createNode(): ShaderFunctionNode {
    return new ShaderFunctionNode();
  }

}

export class ShaderFunctionNode{

  // create a fragmentshader from this node
  makeFragmentShader() {
    
  }

  fillInput(key:string, input) {
    
  }
}

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

