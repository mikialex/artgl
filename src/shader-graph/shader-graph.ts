import { GLProgramConfig } from "../webgl/program";
import { genFragShader, genVertexShader } from "./code-gen";
import {
  ShaderInputNode, ShaderTexture,
  ShaderAttributeInputNode, ShaderInnerUniformInputNode,
  ShaderCommonUniformInputNode, ShaderNode, ShaderVaryInputNode, ShaderTextureFetchNode
} from "./shader-node";
import { Nullable } from "../type";

export class ShaderGraphDecorator {
  decoratedGraph: ShaderGraph

  decorate(graph: ShaderGraph) {
    
  }
}

export class ShaderGraph {
  fragmentRoot: Nullable<ShaderNode>;
  vertexRoot: Nullable<ShaderNode>;
  varyings: Map<string, ShaderNode> = new Map();

  setFragmentRoot(root: ShaderNode): ShaderGraph {
    this.fragmentRoot = root;
    return this;
  }

  setVertexRoot(root: ShaderNode): ShaderGraph {
    this.vertexRoot = root;
    return this;
  }

  setVary(key: string, root: ShaderNode): ShaderGraph {
    const ret = this.varyings.get(key);
    if (ret !== undefined) {
      throw 'duplicate vary key found'
    }
    this.varyings.set(key, root);
    return this;
  }

  getFragRoot(): ShaderNode {
    return this.fragmentRoot;
  }

  getVary(key: string): ShaderVaryInputNode {
    const ret = this.varyings.get(key);
    if (ret === undefined) {
      throw 'cant get vary'
    }
    return new ShaderVaryInputNode(key, ret.type);
  }

  reset(): ShaderGraph {
    this.fragmentRoot = null;
    this.vertexRoot = null;
    return this;
  }

  compile(): GLProgramConfig {
    if (this.vertexRoot === null) {
      throw "can't compile shadergraph, vertex root not set"
    }
    if (this.fragmentRoot === null) {
      throw "can't compile shadergraph, fragment root not set"
    }
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
    this.varyings.forEach(vary => {
      vary.traverseDFS(node => {
        nodes.add(node as ShaderNode);
      })
    })
    const nodeList: ShaderNode[] = [];
    nodes.forEach(n => {
      nodeList.push(n);
    })
    return nodeList
  }

  collectInputs() {
    const nodes = this.nodes;
    const inputNodes = nodes.filter(
      n => n instanceof ShaderInputNode
    );

    const attributes = inputNodes
      .filter(node => node instanceof ShaderAttributeInputNode)
      .map((node: ShaderAttributeInputNode) => {
        return {
          name: node.name,
          usage: node.attributeUsage,
          type: node.type,
        }
      });
    const uniforms = inputNodes
      .filter(node => node instanceof ShaderCommonUniformInputNode)
      .map((node: ShaderCommonUniformInputNode) => {
        return {
          name: node.name,
          type: node.type,
          default: node.defaultValue
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
    
    const textureSet = new Set<ShaderTexture>();
    nodes.filter(n => n instanceof ShaderTextureFetchNode)
      .forEach((node: ShaderTextureFetchNode)  => {
        textureSet.add(node.source)
      })
    const textures = [];
    textureSet.forEach(st => {
      textures.push({
        name:st.name,
        type:st.type 
        })
      })

    const varyings = [];
    this.varyings.forEach((node, key) => {
      varyings.push({
        name: key,
        type: node.type,
      })
    })

    return { attributes, uniforms, textures, varyings, uniformsIncludes }
  }

  compileVertexSource(): string {
    return genVertexShader(this);
  }

  compileFragSource(): string {
    return genFragShader(this);
  }

}

