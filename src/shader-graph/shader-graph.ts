import { GLProgramConfig, VaryingDescriptor } from "../webgl/program";
import { genFragShader, genVertexShader } from "./code-gen";
import {
  ShaderInputNode, ShaderTextureNode, ShaderFunctionNode,
  ShaderAttributeInputNode, ShaderVaryInputNode,
  ShaderCommonUniformInputNode, ShaderNode,
} from "./shader-node";
import { attribute, constValue, texture } from "./node-maker";
import { CommonAttribute } from "../webgl/attribute";
import { Vector4 } from "../math";
import { eyeDir } from "./built-in/transform";
import { ChannelType } from "../core/material";
import { Nullable } from "../type";
import { Camera } from "../artgl";
import { GLDataType } from "../core/data-type";


export const UvFragVary = "v_uv"
export const NormalFragVary = "v_normal"
export const NDCPositionFragVary = "v_position_ndc"
export const WorldPositionFragVary = "v_position_world"

export class ShaderGraph {
  constructor() {
    this.reset();
  }

  fragmentRoot: ShaderNode = constValue(new Vector4());
  vertexRoot: ShaderNode = constValue(new Vector4());
  varyings: Map<string, ShaderNode> = new Map();

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

  private declareFragNormal(): ShaderNode {
    if (this.varyings.has(NormalFragVary)) {
      return this.varyings.get(NormalFragVary)!;
    }
    const node = attribute(CommonAttribute.normal, GLDataType.floatVec3);
    this.setVary(NormalFragVary, node)
    return node;
  }

  declareFragUV(): ShaderGraph {
    if (this.varyings.has(UvFragVary)) {
      return this;
    }
    return this.setVary(UvFragVary, attribute(CommonAttribute.uv, GLDataType.floatVec2))
  }

  setVary(key: string, root: ShaderNode): ShaderGraph {
    this.varyings.set(key, root);
    return this;
  }

  getFragRoot(): ShaderNode {
    return this.fragmentRoot;
  }

  getVertRoot(): ShaderNode {
    return this.vertexRoot;
  }

  getVary(key: string): ShaderVaryInputNode {
    let ret = this.varyings.get(key);
    if (ret === undefined) {
      if (key === NormalFragVary) {
        this.declareFragNormal();
        ret = this.varyings.get(key);
      } else {
        throw `cant get vary <${key}>`
      }
    }
    return new ShaderVaryInputNode(key, ret!.type);
  }

  private sharedUniformNodes: Map<string, ShaderCommonUniformInputNode> = new Map();
  getSharedUniform(uniformKey: string) {
    const re = this.sharedUniformNodes.get(uniformKey)
    if (re === undefined) {
      throw `cant found shared uniform <${uniformKey}>`
    }
    return re;
  }
  tryGetSharedUniform(uniformKey: string, or: ShaderNode) {
    const re = this.sharedUniformNodes.get(uniformKey)
    return re === undefined ? or : re;
  }
  getIfSharedUniform(uniformKey: string) {
    return this.sharedUniformNodes.get(uniformKey);
  }
  registerSharedUniform(uniformKey: string, node: ShaderCommonUniformInputNode) {
    this.sharedUniformNodes.set(uniformKey, node);
  }

  private cachedInnerSupportEyeDir: Nullable<ShaderNode> = null;
  getEyeDir(): ShaderNode {
    if (this.cachedInnerSupportEyeDir === null) {
      this.cachedInnerSupportEyeDir = eyeDir.make()
        .input("worldPosition", this.getVary(WorldPositionFragVary))
        .input("cameraWorldPosition", this.getSharedUniform(Camera.WorldPositionKey))
    }
    return this.cachedInnerSupportEyeDir
  }

  private cachedReusedChannelNodes: Map<ChannelType, ShaderNode> = new Map();
  getChannel(channelType: ChannelType): ShaderNode {
    if (!this.cachedReusedChannelNodes.has(channelType)) {
      this.cachedReusedChannelNodes.set(channelType,
        texture(channelType))
    }
    return this.cachedReusedChannelNodes.get(channelType)!
  }

  reset(): ShaderGraph {
    this.varyings.clear();
    this.sharedUniformNodes = new Map();
    this.cachedReusedChannelNodes.clear();
    this.cachedInnerSupportEyeDir = null;
    this.setFragmentRoot(constValue(new Vector4()))
    return this;
  }

  compile(): GLProgramConfig {
    const { results, needDerivative } = genFragShader(this);
    return {
      ...this.collectInputs(),
      vertexShaderString: genVertexShader(this),
      fragmentShaderString: results,
      autoInjectHeader: true,
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

  collectInputs() {
    const nodes = this.nodes;
    const inputNodes = nodes.filter(
      n => n instanceof ShaderInputNode
    );

    const attributes = (inputNodes as ShaderAttributeInputNode[])
      .filter(node => node instanceof ShaderAttributeInputNode)
      .map((node: ShaderAttributeInputNode) => {
        return {
          name: node.name,
          type: node.type,
        }
      });

    const uniforms = (inputNodes as ShaderCommonUniformInputNode[])
      .filter(node => node instanceof ShaderCommonUniformInputNode)
      .map((node: ShaderCommonUniformInputNode) => {
        return {
          name: node.name,
          type: node.type,
          default: node.defaultValue
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

