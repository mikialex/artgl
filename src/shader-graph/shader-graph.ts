import { GLProgramConfig, VaryingDescriptor } from "../webgl/program";
import { genFragShader, genVertexShader } from "./code-gen";
import {
  ShaderInputNode, ShaderTextureNode, ShaderFunctionNode,
  ShaderAttributeInputNode, ShaderInnerUniformInputNode,
  ShaderCommonUniformInputNode, ShaderNode, ShaderVaryInputNode,
} from "./shader-node";
import { attribute, constValue, MVPWorld, texture, innerUniform } from "./node-maker";
import { GLDataType } from "../webgl/shader-util";
import { CommonAttribute } from "../webgl/attribute";
import { Vector4 } from "../math";
import { eyeDir } from "./built-in/transform";
import { ChannelType } from "../core/material";
import { GLTextureType } from "../webgl/uniform/uniform-texture";
import { Nullable } from "../type";


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
        throw 'cant get vary'
      }
    }
    return new ShaderVaryInputNode(key, ret!.type);
  }

  private cachedInnerSupportEyeDir: Nullable<ShaderNode> = null;
  getEyeDir(): ShaderNode {
    if (this.cachedInnerSupportEyeDir === null) {
      this.cachedInnerSupportEyeDir = eyeDir.make()
        .input("worldPosition", this.getVary(WorldPositionFragVary))
        .input("cameraWorldPosition", innerUniform("CameraWorldPosition"))
    }
    return this.cachedInnerSupportEyeDir
  }

  private cachedReusedChannelNodes: Map<ChannelType, ShaderNode> = new Map();
  getChannel(channelType: ChannelType): ShaderNode {
    if (!this.cachedReusedChannelNodes.has(channelType)) {
      this.cachedReusedChannelNodes.set(channelType,
        texture(channelType, GLTextureType.texture2D))
    }
    return this.cachedReusedChannelNodes.get(channelType)!
  }

  reset(): ShaderGraph {
    this.varyings.clear();
    this.cachedReusedChannelNodes.clear();
    this.cachedInnerSupportEyeDir = null;
    this.setVertexRoot(MVPWorld());
    this.setFragmentRoot(constValue(new Vector4()))
    return this;
  }

  compile(): GLProgramConfig {
    const {results, needDerivative } = genFragShader(this);
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
    const uniformsIncludes =  (inputNodes as ShaderInnerUniformInputNode[]) 
      .filter(node => node instanceof ShaderInnerUniformInputNode)
      .map((node: ShaderInnerUniformInputNode) => {
        return {
          name: node.name,
          mapInner: node.mapInner,
        }
      });

    const textures =  (inputNodes as ShaderTextureNode[]) 
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

    return { attributes, uniforms, textures, varyings, uniformsIncludes }
  }

}

