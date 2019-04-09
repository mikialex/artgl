import { ShaderFunction, ShaderFunctionNode } from "./shader-function";
import { GLDataType } from "../webgl/shader-util";
import { AttributeUsage, AttributeDescriptor } from "../webgl/attribute";
import { InnerSupportUniform, InnerUniformMapDescriptor } from "../webgl/uniform/uniform";
import { GLProgramConfig } from "../webgl/program";
import { findFirst } from "../util/array";
import { BuildInShaderFuntions } from "./built-in/index";

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

  constructor() {
    BuildInShaderFuntions.forEach(fun => {
      this.registShaderFunction(fun);
    })
  }

  define: ShaderGraphDefine;

  functionNodeFactories: Map<string, ShaderFunction> = new Map();

  functionNodes: ShaderFunctionNode[] = [];

  // map shaderNodes define name to 
  functionNodesMap: Map<string, ShaderFunctionNode> = new Map();

  setGraph(define: ShaderGraphDefine): void {
    this.reset();
    this.define = define;
    this.constructVertexGraph();
    this.constructFragmentGraph();
  }

  constructVertexGraph() {
    // this.define.transform.
  }

  constructFragmentGraph() {
    this.define.effect.forEach(nodeDefine => {
      const factory = this.functionNodeFactories.get(nodeDefine.type);
      if (!factory) {
        throw "cant find node type: " + nodeDefine.type
      }
      const node = factory.createNode(nodeDefine);
      this.functionNodes.push(node);
      this.functionNodesMap.set(nodeDefine.name, node);
    })
    this.functionNodes.forEach(node => {
      Object.keys(node.define.input).forEach(key => {
        const value = node.define.input[key];
        if (value.type === ShaderGraphNodeInputType.shaderFunctionNode) {
          const fromNode = this.functionNodesMap.get(key);
          if (!fromNode) {
            throw "cant find from node"
          }
          fromNode.connectTo(node);
        }
      })
      
    });
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
    this.functionNodeFactories.set(shaderFn.define.name, shaderFn);
  }

  getEffectRoot() {
    return findFirst(this.functionNodes, node => {
      return node.define.output === "gl_FragColor"
    })
  }
}

export enum ShaderGraphNodeInputType {
  innerUniform,
  floatUnifrom,
  textureUniform,
  shaderFunctionNode,
  Attribute
}
