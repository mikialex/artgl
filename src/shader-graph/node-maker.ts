import { AttributeDescriptor } from "../webgl/attribute";
import { ShaderAttributeInputNode, ShaderCommonUniformInputNode, ShaderInnerUniformInputNode } from "./shader-node";
import { GLDataType } from "../webgl/shader-util";
import { InnerSupportUniform, InnerUniformMap } from "../webgl/uniform/uniform";

export function attribute(att: AttributeDescriptor) {
  return new ShaderAttributeInputNode(att);
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