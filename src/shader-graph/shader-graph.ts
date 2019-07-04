import { ShaderFunction } from "./shader-function";
import { AttributeDescriptor } from "../webgl/attribute";
import { InnerUniformMapDescriptor, UniformDescriptor } from "../webgl/uniform/uniform";
import { GLProgramConfig, VaryingDescriptor } from "../webgl/program";
// import { genFragShader, genVertexShader } from "./code-gen";
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
  }

  define: ShaderGraphDefine;

  functionNodeFactories: Map<string, ShaderFunction> = new Map();

  functionNodes: ShaderFunctionNode[] = [];
  inputNodes: ShaderInputNode[] = [];

  // map shaderNodes define name to 
  functionNodesMap: Map<string, ShaderFunctionNode> = new Map();
  inputNodesMap: Map<string, ShaderInputNode> = new Map();

  setFragmentRoot(shaderFunctionNode) {
    
  }

  // private checkDataTypeIsMatch(node: ShaderFunctionNode, nodeInput: ShaderNode, inputIndex: number) {
  //   const result = node.factory.define.inputs[inputIndex].type === nodeInput.dataType;
  //   if (!result) {
  //     console.warn("node:", node);
  //     console.warn("inputnode:", nodeInput);
  //     throw "constructFragmentGraph failed: type mismatch"
  //   }
  // }

  reset() {
    this.functionNodesMap.clear();
    this.functionNodes = [];
    this.inputNodesMap.clear();
    this.inputNodes = [];
  }

  // compile(): GLProgramConfig {
  //   return {
  //     attributes: this.collectAttributeDepend(),
  //     uniforms: this.collectUniformDepend(),
  //     uniformsIncludes: this.collectInnerUniformDepend(),
  //     varyings: this.collectVaryDepend(),
  //     vertexShaderString: this.compileVertexSource(),
  //     fragmentShaderString: this.compileFragSource(),
  //     autoInjectHeader: true,
  //   };
  // }

  // public visiteAllNodesInput(visitor: (
  //   node: ShaderFunctionNode,
  //   input: ShaderGraphDefineInput,
  //   inputDefine: ShaderFunctionInput,
  //   inputKey: string) => any) {
  //   this.functionNodes.forEach(node => {
  //     Object.keys(node.define.input).forEach((key, index) => {
  //       const input = node.define.input[key];
  //       const inputDefine = node.factory.define.inputs[index];
  //       visitor(node, input, inputDefine, key);
  //     })
  //   })
  // }

  // collectVaryDepend(): VaryingDescriptor[] {
  //   return this.inputNodes
  //     .filter(node => node instanceof ShaderVaryInputNode)
  //     .map((node: ShaderVaryInputNode) => {
  //       return {
  //         name: node.name,
  //         type: node.dataType,
  //       }
  //     });
  // }

  // collectAttributeDepend(): AttributeDescriptor[] {
  //   return this.inputNodes
  //     .filter(node => node instanceof ShaderAttributeInputNode)
  //     .map((node: ShaderAttributeInputNode) => {
  //       return {
  //         name: node.name,
  //         usage: node.attributeUsage,
  //         type: node.dataType,
  //       }
  //     });
  // }

  // collectUniformDepend(): UniformDescriptor[] {
  //   return this.inputNodes
  //     .filter(node => node instanceof ShaderCommonUniformInputNode)
  //     .map((node: ShaderCommonUniformInputNode) => {
  //       return {
  //         name: node.name,
  //         type: node.dataType,
  //       }
  //     });
  // }

  // collectInnerUniformDepend(): InnerUniformMapDescriptor[] {
  //   return this.inputNodes
  //     .filter(node => node instanceof ShaderInnerUniformInputNode)
  //     .map((node: ShaderInnerUniformInputNode) => {
  //       return {
  //         name: node.name,
  //         mapInner: node.mapInner,
  //       }
  //     });
  // }

  // compileVertexSource(): string {
  //   return genVertexShader(this);
  // }

  // compileFragSource(): string {
  //   return genFragShader(this);
  // }

  // registerShaderFunction(shaderFn: ShaderFunction) {
  //   this.functionNodeFactories.set(shaderFn.define.name, shaderFn);
  // }

  // get effectRoot(): ShaderFunctionNode {
  //   return this.functionNodesMap.get(this.define.effectRoot);
  // }

  // get transformRoot(): ShaderFunctionNode {
  //   return this.functionNodesMap.get(this.define.transformRoot);
  // }
}

