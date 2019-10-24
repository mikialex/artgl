import {
  ShaderAttributeInputNode, ShaderCommonUniformInputNode,
  ShaderTextureNode, ShaderNode, ShaderConstType, ShaderConstNode, ShaderCombineNode
} from "./shader-node";
import { Vector2, Vector3, Matrix4, Vector4 } from "../math";
import { Texture } from "../artgl";
import { CubeTexture } from "../core/texture-cube";
import { GLDataType } from "../core/data-type";
import { GLTextureType, CommonAttribute } from "../webgl/interface";

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
  return new ShaderCommonUniformInputNode({ name, type });
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

export function uniformFromValue(name: string, value: any) {
  if (typeof value === "number") {
    return uniform(name, GLDataType.float).default(value);
  } else if (value instanceof Vector2) {
    return uniform(name, GLDataType.floatVec2).default(value);
  } else if (value instanceof Vector3) {
    return uniform(name, GLDataType.floatVec3).default(value);
  } else if (value instanceof Vector4) {
    return uniform(name, GLDataType.floatVec4).default(value);
  } else if (value instanceof Matrix4) {
    return uniform(name, GLDataType.Mat4).default(value);
  } else {
    throw "unsupported uniform value"
  }
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

export function screenQuad() {
  return vec4(
    attribute(CommonAttribute.position, GLDataType.floatVec3),
    constValue(1)
  )
}

export function makeInstance(
  node: ShaderCommonUniformInputNode | ShaderAttributeInputNode
) {
  return new ShaderAttributeInputNode({
    name: node.name, type: node.type
  }).makeInstance();
}