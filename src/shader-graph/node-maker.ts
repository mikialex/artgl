import { AttributeDescriptor } from "../webgl/attribute";
import { ShaderAttributeInputNode, ShaderCommonUniformInputNode, ShaderInnerUniformInputNode, ShaderTextureInputNode, ShaderNode } from "./shader-node";
import { GLDataType } from "../webgl/shader-util";
import { InnerSupportUniform, InnerUniformMap } from "../webgl/uniform/uniform";

// TODO simplify it
export function attribute(att: AttributeDescriptor) {
  return new ShaderAttributeInputNode(att);
}

// TODO support default
export function texture(tex) {
  return new ShaderTextureInputNode(tex);
}

export function uniform(name: string, type: GLDataType) {
  return new ShaderCommonUniformInputNode({
    name, type
  })
}

export function innerUniform(type: InnerSupportUniform) {
  return new ShaderInnerUniformInputNode({
    name: 'inner' + InnerUniformMap.get(type).name,
    mapInner: type,
  })
}

export function vec2(r: ShaderNode, g: ShaderNode) {

}

export function vec3(r: ShaderNode, g: ShaderNode, b: ShaderNode) {

}

export function vec4(r: ShaderNode, g: ShaderNode, b: ShaderNode, a: ShaderNode) {

}