import { genFragShader, genVertexShader } from "./code-gen";
import {
  ShaderInputNode, ShaderTextureNode, ShaderFunctionNode,
  ShaderAttributeInputNode, ShaderVaryInputNode,
  ShaderUniformInputNode, ShaderNode,
} from "./shader-node";
import { attribute, constValue, texture } from "./node-maker";
import { Vector4 }  from "@artgl/math";
import { eyeDir } from "./built-in/transform";
import {
  GLDataType, CommonAttribute, GLProgramConfig, UniformDescriptor, VaryingDescriptor
} from "@artgl/webgl";
import {
  EyeDirection, CameraWorldPosition, ChannelType, WorldPositionFragVary,
  NormalFragVary, UvFragVary
} from "./interface";

export const defaultVertexRoot = constValue(new Vector4());

export class ShaderGraph {
  constructor() {
    this.reset();
  }

  fragmentRoot: ShaderNode = constValue(new Vector4());
  vertexRoot: ShaderNode = defaultVertexRoot;
  varyings: Map<string, ShaderVaryInputNode> = new Map();
  attributes: Map<string, ShaderAttributeInputNode> = new Map();

  setFragmentRoot(root: ShaderNode): ShaderGraph {
    this.fragmentRoot = root;
    return this;
  }

  // TODO maybe can do better
  // this for:  if user use node maker MVPWorld, it can auto gen world position vary for convenient
  updateAutoWorldPositionVary(root: ShaderNode) {
    this.varyings.delete(WorldPositionFragVary);
    if (root instanceof ShaderFunctionNode && root.factory.define.name === "VPTransform") {
      const next = root.inputMap.get("position")
      if (next === undefined) {
        throw `we have a shader function node but the input <position> has no input node`
      }
      if (next instanceof ShaderFunctionNode && next.factory.define.name === "MTransform") {
        this.setVary(WorldPositionFragVary, next.swizzling("xyz"));
      }
    }
  }

  setVertexRoot(root: ShaderNode): ShaderGraph {
    this.vertexRoot = root;
    this.updateAutoWorldPositionVary(root)
    return this;
  }

  private declareFragNormal() {
    if (this.varyings.has(NormalFragVary)) {
      return this.varyings.get(NormalFragVary)!;
    }
    const node = this.getOrMakeAttribute(CommonAttribute.normal, GLDataType.floatVec3);
    this.setVary(NormalFragVary, node)
    return node;
  }

  private declareFragUV() {
    if (this.varyings.has(UvFragVary)) {
      return this.varyings.get(NormalFragVary)!;
    }
    const node = this.getOrMakeAttribute(CommonAttribute.uv, GLDataType.floatVec2);
    this.setVary(UvFragVary, node)
    return node
  }

  getFragRoot() { return this.fragmentRoot; }
  getVertRoot() { return this.vertexRoot; }

  getAttribute(key: string) { return this.attributes.get(key) }
  getOrMakeAttribute(key: string, type: GLDataType) {
    let att = this.getAttribute(key);
    if (att === undefined) {
      this.attributes.set(key, attribute(key, type))
    }
    att = this.getAttribute(key)!;
    if (att.type !== type) {
      throw 'att type not match'
    }
    return att;
  }

  setVary(key: string, root: ShaderNode): ShaderGraph {
    this.varyings.set(key, new ShaderVaryInputNode(key, root.type, root));
    return this;
  }
  getVary(key: string): ShaderVaryInputNode {
    let node = this.varyings.get(key);
    if (node !== undefined) {
      return node;
    }

    if (key === NormalFragVary) {
      this.declareFragNormal();
      return this.varyings.get(key)!;
    } if (key === UvFragVary) {
      this.declareFragUV();
      return this.varyings.get(key)!;
    } else {
      throw `cant get vary <${key}>`
    }
  }

  private sharedNodes: Map<string, ShaderNode> = new Map();
  getSharedUniform(uniformKey: string) {
    const re = this.sharedNodes.get(uniformKey)
    if (re === undefined) {
      throw `cant found shared uniform <${uniformKey}>`
    }
    return re;
  }
  tryGetSharedUniform(uniformKey: string, or: ShaderNode) {
    const re = this.sharedNodes.get(uniformKey)
    return re === undefined ? or : re;
  }
  getIfSharedUniform(uniformKey: string) {
    return this.sharedNodes.get(uniformKey);
  }
  registerSharedUniform(uniformKey: string, node: ShaderNode) {
    this.sharedNodes.set(uniformKey, node);
  }

  getEyeDir(): ShaderNode {
    let node = this.getIfSharedUniform(EyeDirection)
    if (node === undefined) {
      node = eyeDir.make()
      .input("worldPosition", this.getVary(WorldPositionFragVary))
        .input("cameraWorldPosition", this.getSharedUniform(CameraWorldPosition))
      this.registerSharedUniform(EyeDirection, node);
    }
    return node;
  }

  private cachedReusedChannelNodes: Map<ChannelType, ShaderNode> = new Map();
  getChannel(channelType: ChannelType): ShaderNode {
    let node = this.getIfSharedUniform(channelType)
    if (node === undefined) {
      node = texture(channelType)
      this.registerSharedUniform(channelType,  node);
    }
    return node;
  }

  reset(): ShaderGraph {
    this.varyings.clear();
    this.cachedReusedChannelNodes.clear();
    this.sharedNodes.clear();
    this.setFragmentRoot(constValue(new Vector4()))
    return this;
  }

  compile(isWebGL2: boolean, useUBO: boolean): GLProgramConfig {
    const { results, needDerivative } = genFragShader(this, isWebGL2);
    return {
      ...this.collectInputs(useUBO),
      vertexShaderString: genVertexShader(this, isWebGL2),
      fragmentShaderString: results,
      needDerivative
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

  collectInputs(useUBO: boolean) {
    const nodes = this.nodes;
    const inputNodes = nodes.filter(
      n => n instanceof ShaderInputNode
    );

    const graphAttributes: ShaderAttributeInputNode[] = [];
    this.attributes.forEach(a => { graphAttributes.push(a) });

    const attributes = graphAttributes.map((node: ShaderAttributeInputNode) => {
        return {
          name: node.name,
          type: node.type,
        }
      })

    function toUniDes(node: ShaderUniformInputNode): UniformDescriptor {
      let defaultV;
      if (node.defaultValue !== null) {
        if (typeof node.defaultValue === 'number') {
          defaultV = node.defaultValue
        } else {
          defaultV = node.defaultValue.toArray()
        }
      }
      return {
        name: node.name,
        type: node.type,
        default: defaultV,
      }
    }

    const uniforms: UniformDescriptor[] = [];
    (inputNodes as ShaderUniformInputNode[])
      .filter(node => node instanceof ShaderUniformInputNode)
      .forEach((node: ShaderUniformInputNode) => {
        if (!useUBO) {
          uniforms.push(toUniDes(node));
        } else {
          if (!node.wouldBeProxyedByUBO) {
            uniforms.push(toUniDes(node));
          }
        }
      });

    const textures = (inputNodes as ShaderTextureNode[])
      .filter(node => node instanceof ShaderTextureNode)
      .map((node: ShaderTextureNode) => {
        return {
          name: node.name,
          type: node.textureType,
        }
      });

    const varyings: VaryingDescriptor[] = [];
    this.varyings.forEach((node, key) => {
      varyings.push({
        name: key,
        type: node.type,
      })
    })

    return { attributes, uniforms, textures, varyings }
  }

}
