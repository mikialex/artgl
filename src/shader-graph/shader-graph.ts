import { ShaderFunction, ShaderFunctionNode } from "./shader-function";
import { GLDataType } from "../webgl/shader-util";
import { AttributeUsage, AttributeDescriptor } from "../webgl/attribute";
import { InnerSupportUniform, InnerUniformMapDescriptor } from "../webgl/uniform/uniform";
import { GLProgramConfig } from "../webgl/program";
import { findFirst } from "../util/array";

export interface ShaderGraphDefineInput {
  type: ShaderGraphNodeInputType,
  value?: any
}

export interface ShaderGraphNodeDefine {
  output: string,
  name: string,
  type: string,
  input: { [index: string]: ShaderGraphDefineInput }
}


export interface ShaderGraphDefine {
  effect: ShaderGraphNodeDefine[],
  transform?: ShaderGraphNodeDefine[],

}


export class ShaderGraph {

  define: ShaderGraphDefine;
  functionNodes: ShaderFunctionNode[] = [];

  // map shaderNodes define name to 
  functionNodesMap: Map<string, ShaderFunctionNode> = new Map();

  setGraph(define: ShaderGraphDefine): void {
    this.reset();
    this.define = define;
  }

  constructVertexGraph() {
    // this.define.transform.
  }

  constructFragmentGraph() {

  }

  reset() {
    this.functionNodesMap.clear();
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

  collectAttributeDepend(): AttributeDescriptor[] {
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

  getEffectRoot() {
    const root = findFirst(this.functionNodes, node => {
      return node.name === "gl_FragColor"
    })
    if (!root) {
      throw "cant find root of effect"
    }
    return root;
  }
}

const graph = new ShaderGraph();

export enum ShaderGraphNodeInputType {
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
      name: "result",
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
      name: "diffuse",
      type: "diffuse_lookup",
      input: {
        diffTex: {
          type: ShaderGraphNodeInputType.textureUniform,
        }
      }
    },
    {
      output: "IBL",
      name: "IBL",
      type: "envTex_cal",
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
      name: "root",
      output: "gl_Position",
      type: "VPtransfrom",
      input: {
        VPMatrix: {
          type: ShaderGraphNodeInputType.innerUniform,
          value: InnerSupportUniform.VPMatrix
        },
        position: {
          type: ShaderGraphNodeInputType.Attribute
        }
      }
    },
  ],


})

const techniqueConf = graph.compile();