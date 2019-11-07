import { genFragShader, genVertexShader } from "./code-gen";
import {
  ShaderInputNode, ShaderTextureNode, ShaderFunctionNode,
  ShaderAttributeInputNode, ShaderVaryInputNode,
  ShaderUniformInputNode, ShaderNode,
} from "./shader-node";
import { attribute, constValue, texture } from "./node-maker";
import { Vector4 } from "../math";
import { eyeDir } from "./built-in/transform";
import { ChannelType } from "../core/material";
import { Nullable } from "../type";
import { Camera, ShaderUniformProvider } from "../artgl";
import { GLDataType, valueToGLType, valueToFlatted } from "../core/data-type";
import { GLProgramConfig, VaryingDescriptor, CommonAttribute, UniformDescriptor, UniformBlockDescriptor } from "../webgl/interface";


export const UvFragVary = "v_uv"
export const NormalFragVary = "v_normal"
export const NDCPositionFragVary = "v_position_ndc"
export const WorldPositionFragVary = "v_position_world"

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

  private sharedUniformNodes: Map<string, ShaderUniformInputNode> = new Map();
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
  registerSharedUniform(uniformKey: string, node: ShaderUniformInputNode) {
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

  compile(isWebGL2: boolean, useUBO: boolean, providerMap: Map<ShaderUniformProvider, number>): GLProgramConfig {
    if (!isWebGL2) { useUBO = false; }

    const uniformBlocks: UniformBlockDescriptor[] = [];
    providerMap.forEach((keyIndex, provider) => {
      if (!provider.shouldProxyedByUBO || !useUBO) {
        return;
      }
      const des = makeBlockUniformDescriptorFromProvider(provider, keyIndex);
      if (des !== null) {
        uniformBlocks.push(des);
      }
    })

    const { results, needDerivative } = genFragShader(this, isWebGL2);
    return {
      ...this.collectInputs(useUBO),
      uniformBlocks,
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

function makeBlockUniformDescriptorFromProvider(
  p: ShaderUniformProvider, providerIndex: number): Nullable<UniformBlockDescriptor> {
  if (p.uploadCache === undefined) {
    return null;
  }
  const uniforms: UniformDescriptor[] = [];
  p.uploadCache.uniforms.forEach((u, name) => {
    uniforms.push({
      name: u.uniformName,
      type: valueToGLType(u.value),
      default: valueToFlatted(u.value),
    })
  })
  if (uniforms.length === 0) {
    return null;
  }
  return {
    name: "ubo" + providerIndex,
    uniforms
  }
}