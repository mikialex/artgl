import { ShaderFunction, ShaderFunctionNode } from "./shader-function";
import { GLDataType } from "../webgl/shader-util";
import { AttributeUsage, AttributeDescriptor } from "../webgl/attribute";
import { InnerSupportUniform, InnerUniformMapDescriptor } from "../webgl/uniform/uniform";
import { GLProgramConfig } from "../webgl/program";

export interface ShaderGraphDefine {
  effect,
  transform,

}


export class ShaderGraph {

  graph: ShaderFunctionNode[] = [];

  // map shaderNodes define name to 
  passNodes: Map<string, ShaderFunctionNode> = new Map();

  setGraph(define: ShaderGraphDefine): void {

  }

  compile(): GLProgramConfig {
    return {
      attributes: this.collectAttributeDepend(),
      uniformsIncludes: this.collectInnerUniformDepend(),
      varyings: [
        { name: 'color', type: GLDataType.floatVec3 }
      ],
      vertexShaderString: this.compileVertexSource(),
      fragmentShaderString: this.compileFragSource(),
      autoInjectHeader: true,
    };
  }

  collectAttributeDepend(): AttributeDescriptor[]{
    return [
      { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position, stride: 3 },
      { name: 'normal', type: GLDataType.floatVec3, usage: AttributeUsage.normal, stride: 3 },
      // { name: 'uv', type: GLDataType.floatVec2, usage: AttributeUsage.uv, stride: 2 },
    ]
  }

  collectInnerUniformDepend(): InnerUniformMapDescriptor[] {
    return [
      { name: 'MMatrix', mapInner: InnerSupportUniform.MMatrix, },
      { name: 'VPMatrix', mapInner: InnerSupportUniform.VPMatrix, }
    ]
  }

  compileVertexSource(): string {
    return ""
  }

  compileFragSource(): string {
    return ""
  }

  registShaderFunction(shaderFn: ShaderFunction) {

  }
}

const graph = new ShaderGraph();

export enum ShaderGraphNodeInputType{
  innerUniform,
  textureUniform,
  shaderFunctionNode,
  Attribute
}

graph.setGraph({

  // decalare your fragment shader graph
  // fragment shader graph should have a root node
  // which output is gl_FragColor as the screen fragment output
  effect: [
    {
      output: "gl_FragColor",
      type: "composeAdd",
      input: {
        diffuse: {
          type: ShaderGraphNodeInputType.shaderFunctionNode,
        },
        IBL: {
          type: ShaderGraphNodeInputType.shaderFunctionNode,
        },
      }
    },
    {
      output: "diffuse",
      type: "diffuse",
      input: {
        envTex: {
          type: ShaderGraphNodeInputType.textureUniform,
        }
      }
    },
    {
      output: "IBL",
      type: "envTex",
      input: {
        envTex: {
          type: ShaderGraphNodeInputType.textureUniform,
        }
      }
    },
  ],

  // declare your vertex shader graph
  // like frag, we export the graph root as gl_Position
  transform: [
    {
      output: "gl_Position",
      type: "VPtransfrom",
      input: {
        VPMatrix: {
          type: ShaderGraphNodeInputType.innerUniform,
          innerValue: InnerSupportUniform.VPMatrix
        },
        position: {
          type:ShaderGraphNodeInputType.Attribute
        }
      }
    },
  ],


})

const technique = graph.compile();