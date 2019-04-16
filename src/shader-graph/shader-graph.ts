import { ShaderFunction, ShaderFunctionNode } from "./shader-function";
import { GLDataType, getGLDataTypeDefaultDefaultValue } from "../webgl/shader-util";
import { AttributeUsage, AttributeDescriptor } from "../webgl/attribute";
import { InnerSupportUniform, InnerUniformMapDescriptor, UniformDescriptor } from "../webgl/uniform/uniform";
import { GLProgramConfig, VaryingDescriptor } from "../webgl/program";
import { findFirst } from "../util/array";
import { BuildInShaderFuntions } from "./built-in/index";
import { genFragmentShader } from "./code-gen";

export enum ShaderGraphNodeInputType {
  commenUniform,
  textureUniform,

  shaderFunctionNode,
  attribute,
  varying,
}


export interface ShaderGraphDefineInput {
  type: ShaderGraphNodeInputType,
  dataType: GLDataType,
  typeInfo?: any,
  isInnerValue?: boolean,
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
    this.functionNodes = [];
  }

  compile(): GLProgramConfig {
    return {
      attributes: this.collectAttributeDepend(),
      uniforms: this.collectUniformDepend(),
      uniformsIncludes: this.collectInnerUniformDepend(),
      varyings: this.collectVaryDepend(),
      vertexShaderString: this.compileVertexSource(),
      fragmentShaderString: this.compileFragSource(),
      autoInjectHeader: true,
    };
  }

  private visiteAllNodesInput(visitor: (
    node: ShaderFunctionNode,
    input: ShaderGraphDefineInput,
    inputKey: string) => any) {
    this.functionNodes.forEach(node => {
      Object.keys(node.define.input).forEach(key => {
        const input = node.define.input[key];
        visitor(node, input, key)
      })
    })
  }

  collectVaryDepend(): VaryingDescriptor[] {
    const varyingList: VaryingDescriptor[] = [];
    this.visiteAllNodesInput((_node, input, key) => {
      if (input.type === ShaderGraphNodeInputType.varying) {
        varyingList.push({
          name: key,
          type: input.dataType,
        })
      }
    })
    return varyingList;
  }

  collectAttributeDepend(): AttributeDescriptor[] {
    const attributeList: AttributeDescriptor[] = [];
    this.visiteAllNodesInput((_node, input, key) => {
      if (input.type === ShaderGraphNodeInputType.attribute) {
        let attusage = AttributeUsage.unset;
        if (input.typeInfo && input.typeInfo.usage) {
          attusage = input.typeInfo.usage
        }
        attributeList.push({
          name: key,
          type: input.dataType,
          usage: attusage
        })
      }
    })
    return attributeList;
  }

  collectUniformDepend(): UniformDescriptor[] {
    const uniformList: UniformDescriptor[] = [];
    this.visiteAllNodesInput((_node, input, key) => {
      if (input.type === ShaderGraphNodeInputType.varying) {
        uniformList.push({
          name: key,
          type: input.dataType,
        })
      }
    })
    return uniformList;
  }

  collectInnerUniformDepend(): InnerUniformMapDescriptor[] {
    const innerUniformList: InnerUniformMapDescriptor[] = [];
    this.visiteAllNodesInput((_node, input, key) => {
      if (input.type === ShaderGraphNodeInputType.commenUniform
      && input.isInnerValue) {
        innerUniformList.push({
          name: key,
          mapInner: input.value,
        })
      }
    })
    return innerUniformList;
  }

  compileVertexSource(): string {
    return ""
  }

  compileFragSource(): string {
    return genFragmentShader(this);
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

