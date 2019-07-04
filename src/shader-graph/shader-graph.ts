import { ShaderFunction, ShaderFunctionInput } from "./shader-function";
import { AttributeDescriptor } from "../webgl/attribute";
import { InnerUniformMapDescriptor, UniformDescriptor } from "../webgl/uniform/uniform";
import { GLProgramConfig, VaryingDescriptor } from "../webgl/program";
import { BuildInShaderFunctions } from "./built-in/index";
import { genFragShader, genVertexShader } from "./code-gen";
import { TextureDescriptor } from '../webgl/uniform/uniform-texture';
import {
  ShaderFunctionNode, ShaderInputNode,
  ShaderAttributeInputNode, ShaderInnerUniformInputNode,
  ShaderCommonUniformInputNode, ShaderVaryInputNode, ShaderNode
} from "./shader-node";

export enum ShaderGraphNodeInputType {
  commonUniform,
  innerUniform,
  textureUniform,

  shaderFunctionNode,
  attribute,
  varying,
}


export interface ShaderGraphDefineInput {
  type: ShaderGraphNodeInputType,
  value: string
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
  transform: ShaderGraphNodeDefine[],
  transformRoot: string

}



export class ShaderGraph {

  constructor() {
    BuildInShaderFunctions.forEach(fun => {
      this.registerShaderFunction(fun);
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
    this.createFunctionNodes(this.define.transform)
    this.createFunctionNodes(this.define.effect);
    this.constructGraph();
  }

  private createInputs() {
    this.define.attributes.forEach(att => {
      const node = new ShaderAttributeInputNode(att);
      this.inputNodes.push(node);
      this.inputNodesMap.set(node.name, node);
    });
    this.define.uniforms.forEach(uni => {
      const node = new ShaderCommonUniformInputNode(uni);
      this.inputNodes.push(node);
      this.inputNodesMap.set(node.name, node);
    });
    this.define.uniformsIncludes.forEach(uni => {
      const node = new ShaderInnerUniformInputNode(uni);
      this.inputNodes.push(node);
      this.inputNodesMap.set(node.name, node);
    });
  }

  private createFunctionNodes(defines: ShaderGraphNodeDefine[]) {
    defines.forEach(nodeDefine => {
      const factory = this.functionNodeFactories.get(nodeDefine.type);
      if (!factory) {
        throw "cant find node type: " + nodeDefine.type
      }
      const node = factory.createNode(nodeDefine);
      this.functionNodes.push(node);
      this.functionNodesMap.set(nodeDefine.name, node);
    })
  }

  private constructGraph() {
    this.functionNodes.forEach(node => {
      Object.keys(node.define.input).forEach((key, index) => {
        const input = node.define.input[key];
        if (input.type === ShaderGraphNodeInputType.shaderFunctionNode) {
          const fromNode = this.functionNodesMap.get(input.value);
          if (!fromNode) {
            console.warn(key);
            console.warn(node);
            throw "constructShaderGraph failed: cant find from node"
          }
          this.checkDataTypeIsMatch(node, fromNode, index);
          fromNode.connectTo(node);
        } else {
          const fromNode = this.inputNodesMap.get(input.value);
          if (!fromNode) {
            console.warn(key);
            console.warn(node);
            throw "constructShaderGraph failed: cant find from node"
          }
          this.checkDataTypeIsMatch(node, fromNode, index);
          fromNode.connectTo(node);

        }
      })
    });
  }

  private checkDataTypeIsMatch(node: ShaderFunctionNode, nodeInput: ShaderNode, inputIndex: number) {
    const result = node.factory.define.inputs[inputIndex].type === nodeInput.dataType;
    if (!result) {
      console.warn("node:", node);
      console.warn("inputnode:", nodeInput);
      throw "constructFragmentGraph failed: type mismatch"
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
      .filter(node => node instanceof ShaderAttributeInputNode)
      .map((node: ShaderAttributeInputNode) => {
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
    return genVertexShader(this);
  }

  compileFragSource(): string {
    return genFragShader(this);
  }

  registerShaderFunction(shaderFn: ShaderFunction) {
    this.functionNodeFactories.set(shaderFn.define.name, shaderFn);
  }

  get effectRoot(): ShaderFunctionNode {
    return this.functionNodesMap.get(this.define.effectRoot);
  }

  get transformRoot(): ShaderFunctionNode {
    return this.functionNodesMap.get(this.define.transformRoot);
  }
}

