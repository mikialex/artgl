import {
  ShaderAttributeInputNode, ShaderCommonUniformInputNode, ShaderInnerUniformInputNode,
  ShaderTextureNode, ShaderNode, ShaderConstType, ShaderConstNode, ShaderCombineNode
} from "./shader-node";
import { GLDataType } from "../webgl/shader-util";
import { InnerSupportUniform, InnerUniformMap } from "../webgl/uniform/uniform";
import { GLTextureType } from "../webgl/uniform/uniform-texture";
import { VPTransform, MTransform } from "./built-in/transform";
import { Vector2 } from "../math/vector2";
import { Vector3, Matrix4 } from "../math";
import { Vector4 } from "../math/vector4";
import { CommonAttribute } from "../webgl/attribute";

// TODO simplify it
export function attribute(name: string, type: GLDataType) {
  return new ShaderAttributeInputNode({ name, type });
}

export function texture(name: string, type?: GLTextureType) {
  const t = type !== undefined ? type : GLTextureType.texture2D;
  return new ShaderTextureNode(name, GLDataType.sampler2D, t);
}

export function uniform(name: string, type: GLDataType) {
  return new ShaderCommonUniformInputNode({ name, type });
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
    throw "un support uniform value"
  }
}

export function innerUniform(type: InnerSupportUniform) {
  return new ShaderInnerUniformInputNode({
    name: 'inner' + InnerUniformMap.get(type).name,
    mapInner: type,
  })
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

export function constValue(value: any) {
  return new ShaderConstNode(value);
}

export function MVPWorld() {
  return VPTransform.make()
    .input("VPMatrix", innerUniform(InnerSupportUniform.VPMatrix))
    .input("position",
      MTransform.make()
        .input('MMatrix', innerUniform(InnerSupportUniform.MMatrix))
        .input('position', attribute(CommonAttribute.position, GLDataType.floatVec3))
    )
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