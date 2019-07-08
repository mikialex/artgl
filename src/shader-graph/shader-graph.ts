import { GLProgramConfig } from "../webgl/program";
import { genFragShader, genVertexShader } from "./code-gen";
import {
  ShaderFunctionNode, ShaderInputNode,
  ShaderAttributeInputNode, ShaderInnerUniformInputNode,
  ShaderCommonUniformInputNode, ShaderVaryInputNode, ShaderNode
} from "./shader-node";
import { Nullable } from "../type";

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


export class ShaderGraph {
  fragmentRoot: Nullable<ShaderFunctionNode>;
  vertexRoot: Nullable<ShaderFunctionNode>;
  varyings: Map<string, ShaderFunctionNode> = new Map();

  setFragmentRoot(root: ShaderFunctionNode): ShaderGraph {
    this.fragmentRoot = root;
    return this;
  }

  setVertexRoot(root: ShaderFunctionNode): ShaderGraph {
    this.vertexRoot = root;
    return this;
  }

  setVary(key: string, root: ShaderFunctionNode): ShaderGraph {
    const ret = this.varyings.get(key);
    if (ret !== undefined) {
      throw 'duplicate vary key found'
    }
    this.varyings.set(key, root);
    return this;
  }

  getVary(key): ShaderFunctionNode {
    const ret = this.varyings.get(key);
    if (ret === undefined) {
      throw 'cant get vary'
    }
    return ret;
  }

  reset() {
    this.fragmentRoot = null;
    this.vertexRoot = null;
  }

  compile(): GLProgramConfig {
    return {
      ...this.collectInputs(),
      vertexShaderString: this.compileVertexSource(),
      fragmentShaderString: this.compileFragSource(),
      autoInjectHeader: true,
    };
  }

  // TODO maybe should cache
  get nodes() {
    const nodes: Set<ShaderNode> = new Set();
    this.fragmentRoot.traverseDFS(node => {
      nodes.add(node as ShaderNode);
    })
    this.vertexRoot.traverseDFS(node => {
      nodes.add(node as ShaderNode);
    })
    const nodeList: ShaderNode[] = [];
    nodes.forEach(n => {
      nodeList.push(n);
    })
    return nodeList
  }

  collectInputs() {
    const inputNodes = this.nodes.filter(
      n => n instanceof ShaderInputNode
    );

    const attributes = inputNodes
      .filter(node => node instanceof ShaderAttributeInputNode)
      .map((node: ShaderAttributeInputNode) => {
        return {
          name: node.name,
          usage: node.attributeUsage,
          type: node.dataType,
        }
      });
    const uniforms = inputNodes
      .filter(node => node instanceof ShaderCommonUniformInputNode)
      .map((node: ShaderCommonUniformInputNode) => {
        return {
          name: node.name,
          type: node.dataType,
        }
      });
    const uniformsIncludes = inputNodes
        .filter(node => node instanceof ShaderInnerUniformInputNode)
        .map((node: ShaderInnerUniformInputNode) => {
          return {
            name: node.name,
            mapInner: node.mapInner,
          }
        });
    const varyings = inputNodes
        .filter(node => node instanceof ShaderVaryInputNode)
        .map((node: ShaderVaryInputNode) => {
          return {
            name: node.name,
            type: node.dataType,
          }
        });

    return { attributes, uniforms, varyings, uniformsIncludes }
  }

  compileVertexSource(): string {
    return genVertexShader(this);
  }

  compileFragSource(): string {
    return genFragShader(this);
  }

}

