import { AttributeDescriptor, AttributeUsage } from "../webgl/attribute";
import { ShaderAttributeInputNode, ShaderCommonUniformInputNode, ShaderInnerUniformInputNode, ShaderTexture, ShaderNode, ShaderConstType, ShaderConstNode, ShaderCombineNode } from "./shader-node";
import { GLDataType } from "../webgl/shader-util";
import { InnerSupportUniform, InnerUniformMap } from "../webgl/uniform/uniform";
import { GLTextureType } from "../webgl/uniform/uniform-texture";
import { MVPTransform, VPTransform, MTransform } from "./built-in/transform";

// TODO simplify it
export function attribute(att: AttributeDescriptor) {
  return new ShaderAttributeInputNode(att);
}

export function texture(name: string, type?: GLTextureType) {
  const t = type !== undefined ? type :  GLTextureType.texture2D;
  return new ShaderTexture(name, t);
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

export function value(value: ShaderConstType){
  return new ShaderConstNode(value);
}

export function vec2(...args: ShaderNode[] ) {
  return new ShaderCombineNode(args, GLDataType.floatVec2)
}

export function vec3(...args: ShaderNode[] ) {
  return new ShaderCombineNode(args, GLDataType.floatVec3)
}

export function vec4(...args: ShaderNode[] ) {
  return new ShaderCombineNode(args, GLDataType.floatVec4)
}

export function constValue(value: any){
  return new ShaderConstNode(value);
}

export function MVPWorld() {

  return VPTransform.make()
  .input("VPMatrix", innerUniform(InnerSupportUniform.VPMatrix))
    .input("position",
      MTransform.make()
      .input('MMatrix', innerUniform(InnerSupportUniform.MMatrix))
      .input('position', attribute(
        { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position }
      ))
    )

  // return MVPTransform.make()
  // .input("VPMatrix", innerUniform(InnerSupportUniform.VPMatrix))
  // .input("MMatrix", innerUniform(InnerSupportUniform.MMatrix))
  // .input("position", attribute(
  //   { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position }
  // ))
}

export function screenQuad() {
  return vec4(
    attribute(
    { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position }
    ),
    constValue(1)
  )
}