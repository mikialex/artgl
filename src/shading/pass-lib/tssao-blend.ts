import { Shading } from "../../core/technique";
import { GLDataType } from "../../webgl/shader-util";
import { AttributeUsage } from "../../webgl/attribute";
import { ShaderFunction } from "../../shader-graph/shader-function";
import { texture, uniform, attribute, vec4, constValue } from "../../shader-graph/node-maker";


const tssaoBlend = new ShaderFunction({
  source: `
  vec4 tssaoBlend(
    vec3 color, 
    vec3 aoColor, 
    float sampleCount, 
    float tssaoComposeRate,
    float tssaoShowThreshold,
    float tssaoComposeThreshold
    ) {
    vec3 aoModify = vec3(1.0) - tssaoComposeRate * (vec3(1.0) - aoColor) * vec3(min(sampleCount / tssaoShowThreshold, 1.0));
    aoModify = clamp(aoModify + vec3(tssaoComposeThreshold), vec3(0.0), vec3(1.0));
    return vec4(color * aoModify, 1.0);
  }
  `
})

export class TSSAOBlendShading extends Shading {

  update() {
    this.graph.reset()
      .setVertexRoot(vec4(attribute(
        { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position }
      ), constValue(1)))
      .setVary("v_uv", attribute(
        { name: 'uv', type: GLDataType.floatVec2, usage: AttributeUsage.uv }
      ))
      .setFragmentRoot(
        tssaoBlend.make()
          .input("color", texture("basic").fetch(this.graph.getVary('v_uv')).swizzling("xyz"))
          .input("aoColor", texture("tssao").fetch(this.graph.getVary('v_uv')).swizzling("xyz"))
          .input('sampleCount', uniform("u_sampleCount", GLDataType.float).default(0))
          .input('tssaoComposeRate', uniform("u_tssaoComposeRate", GLDataType.float).default(1))
          .input('tssaoShowThreshold', uniform("u_tssaoShowThreshold", GLDataType.float).default(200))
          .input('tssaoComposeThreshold', uniform("u_tssaoComposeThreshold", GLDataType.float).default(0.5))
      )
  }

}