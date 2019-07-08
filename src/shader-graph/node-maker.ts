import { AttributeDescriptor } from "../webgl/attribute";
import { ShaderAttributeInputNode, ShaderCommonUniformInputNode } from "./shader-node";
import { GLDataType } from "../webgl/shader-util";

export function makeAttribute(att: AttributeDescriptor) {
  return new ShaderAttributeInputNode(att);
}

export function makeUniform(name: string, type: GLDataType) {
  return new ShaderCommonUniformInputNode({
   name, type
  })
}