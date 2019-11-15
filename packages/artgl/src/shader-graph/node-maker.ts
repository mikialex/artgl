import {
  ShaderAttributeInputNode, ShaderUniformInputNode,
  ShaderTextureNode, ShaderNode, ShaderConstType, ShaderConstNode, ShaderCombineNode
} from "./shader-node";
import { ArrayFlattenable } from "@artgl/math";
import { Texture } from "../artgl";
import { CubeTexture } from "../core/texture-cube";
import { ShaderGraph } from "./shader-graph";
import { GLDataType, GLTextureType, CommonAttribute } from "@artgl/webgl";
import { valueToGLType } from "../core/data-type";

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

export function textureFromValue(textureName:string, value: Texture | CubeTexture){
  if (value instanceof Texture) {
    return texture(textureName);
  } else if (value instanceof CubeTexture) {
    return cubeTexture(textureName);
  }  else {
    throw "unsupported uniform value"
  }
}

export function uniformFromValue(name: string, value: ArrayFlattenable | number) {
  return uniform(name, valueToGLType(value)).default(value);
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