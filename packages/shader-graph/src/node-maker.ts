import {
  ShaderAttributeInputNode, ShaderUniformInputNode,
  ShaderTextureNode, ShaderNode, ShaderConstType, ShaderConstNode, ShaderCombineNode
} from "./shader-node";
import { ShaderGraph } from "./shader-graph";
import { GLDataType, GLTextureType, CommonAttribute } from "@artgl/webgl";

export function attribute(name: string, type: GLDataType) {
  return new ShaderAttributeInputNode({ name, type });
}

export function texture(name: string) {
  return new ShaderTextureNode(name, GLDataType.sampler2D, GLTextureType.texture2D);
}

export function cubeTexture(name: string) {
  return new ShaderTextureNode(name, GLDataType.samplerCube, GLTextureType.textureCube);
}

export function uniform(name: string, type: GLDataType) {
  return new ShaderUniformInputNode({ name, type });
}

export function value(value: ShaderConstType) {
  return new ShaderConstNode(value);
}

export function vec2(...args: ShaderNode[]) {
  return new ShaderCombineNode(args, GLDataType.floatVec2)
}

export function vec3(...args: ShaderNode[]) {
  return new ShaderCombineNode(args, GLDataType.floatVec3)
}

export function vec4(...args: ShaderNode[]) {
  return new ShaderCombineNode(args, GLDataType.floatVec4)
}

export function constValue(value: ShaderConstType) {
  return new ShaderConstNode(value);
}

export function screenQuad(graph: ShaderGraph) {
  return vec4(
    graph.getOrMakeAttribute(CommonAttribute.position, GLDataType.floatVec3),
    constValue(1)
  )
}

export function makeInstance(
  node: ShaderUniformInputNode | ShaderAttributeInputNode
) {
  return new ShaderAttributeInputNode({
    name: node.name, type: node.type
  }).makeInstance();
}