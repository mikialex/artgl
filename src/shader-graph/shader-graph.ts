import { ShaderFunction, ShaderFunctionInput } from "./shader-function";
import { AttributeDescriptor } from "../webgl/attribute";
import { InnerUniformMapDescriptor, UniformDescriptor } from "../webgl/uniform/uniform";
import { GLProgramConfig, VaryingDescriptor } from "../webgl/program";
import { BuildInShaderFuntions } from "./built-in/index";
import { genShader } from "./code-gen";
import { TextureDescriptor } from '../webgl/uniform/uniform-texture';
import {
  ShaderFunctionNode, ShaderInputNode,
  ShaderInnerAttributeInputNode, ShaderInnerUniformInputNode,
  ShaderCommonUniformInputNode, ShaderVaryInputNode
} from "./shader-node";

export enum ShaderGraphNodeInputType {
  commenUniform,
  textureUniform,

  shaderFunctionNode,
  attribute,
  varying,
}


export interface ShaderGraphDefineInput {
  type: ShaderGraphNodeInputType,
  typeInfo?: any,
  isInnerValue?: boolean,
  value?: any
}

export interface ShaderGraphNodeDefine {
  name: string,
  type: string,
  input: { [index: string]: ShaderGraphDefineInput }
}


export interface ShaderGraphDefine {
  attributes: AttributeDescriptor[];
  uniforms?: UniformDescriptor[];
  uniformsIncludes?: InnerUniformMapDescriptor[];
  varyings?: VaryingDescriptor[];
  textures?: TextureDescriptor[];
  effect: ShaderGraphNodeDefine[],
  effectRoot: string,
  transform?: ShaderGraphNodeDefine[],
  transformRoot: string

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
  inputNodes: ShaderInputNode[] = [];

  // map shaderNodes define name to 
  functionNodesMap: Map<string, ShaderFunctionNode> = new Map();
  inputNodesMap: Map<string, ShaderInputNode> = new Map();

  setGraph(define: ShaderGraphDefine): void {
    this.reset();
    this.define = define;
    this.createInputs();
    this.constructVertexGraph();
    this.constructFragmentGraph();
  }

  private createInputs() {
    this.define.attributes.forEach(att => {
      const node = new ShaderInnerAttributeInputNode(att);
      this.inputNodes.push(node);
      this.inputNodesMap.set(node.name, node);
    })
  }

  private constructVertexGraph() {
    // this.define.transform.
  }

  private constructFragmentGraph() {
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
      Object.keys(node.define.input).forEach((key, index) => {
        const input = node.define.input[key];
        if (input.type === ShaderGraphNodeInputType.shaderFunctionNode) {
          const fromNode = this.functionNodesMap.get(input.value);
          if (!fromNode) {
            console.warn(key);
            console.warn(node);
            throw "constructFragmentGraph failed: cant find from node"
          }
          this.checkDataTypeIsMatch(node, fromNode, index);
          fromNode.connectTo(node);
        }
      })
      
    });
  }

  private checkDataTypeIsMatch(node: ShaderFunctionNode, nodeInput:ShaderFunctionNode, inputIndex: number) {
    const result = node.factory.define.inputs[inputIndex].type === nodeInput.factory.define.returnType;
    if (!result) {
      console.warn("node:", node);
      console.warn("inputnode:", nodeInput);
      throw "constructFragmentGraph failed: type missmatch"
    }
  }

  reset() {
    this.functionNodesMap.clear();
    this.functionNodes = [];
    this.inputNodesMap.clear();
    this.inputNodes = [];
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

  public visiteAllNodesInput(visitor: (
    node: ShaderFunctionNode,
    input: ShaderGraphDefineInput,
    inputDefine: ShaderFunctionInput,
    inputKey: string) => any) {
    this.functionNodes.forEach(node => {
      Object.keys(node.define.input).forEach((key, index) => {
        const input = node.define.input[key];
        const inputDefine = node.factory.define.inputs[index];
        visitor(node, input, inputDefine, key);
      })
    })
  }

  collectVaryDepend(): VaryingDescriptor[] {
    return this.inputNodes
      .filter(node => node instanceof ShaderVaryInputNode)
      .map((node: ShaderVaryInputNode) => {
        return {
          name: node.name,
          type: node.dataType,
        }
      });
  }

  collectAttributeDepend(): AttributeDescriptor[] {
    return this.inputNodes
      .filter(node => node instanceof ShaderInnerAttributeInputNode)
      .map((node: ShaderInnerAttributeInputNode) => {
        return {
          name: node.name,
          usage: node.attributeUsage,
          type: node.dataType,
        }
      });
  }

  collectUniformDepend(): UniformDescriptor[] {
    return this.inputNodes
      .filter(node => node instanceof ShaderCommonUniformInputNode)
      .map((node: ShaderCommonUniformInputNode) => {
        return {
          name: node.name,
          type: node.dataType,
        }
      });
  }

  collectInnerUniformDepend(): InnerUniformMapDescriptor[] {
    return this.inputNodes
      .filter(node => node instanceof ShaderInnerUniformInputNode)
      .map((node: ShaderInnerUniformInputNode) => {
        return {
          name: node.name,
          mapInner: node.mapInner,
        }
      });
  }

  compileVertexSource(): string {
    return genShader(this, this.transformRoot);
  }

  compileFragSource(): string {
    return genShader(this, this.effectRoot);
  }

  registShaderFunction(shaderFn: ShaderFunction) {
    this.functionNodeFactories.set(shaderFn.define.name, shaderFn);
  }

  get effectRoot(): ShaderFunctionNode {
    return this.functionNodesMap.get(this.define.effectRoot);
  }

  get transformRoot(): ShaderFunctionNode {
    return this.functionNodesMap.get(this.define.transformRoot);
  }
}

