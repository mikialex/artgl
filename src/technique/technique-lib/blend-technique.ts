import { Technique } from "../../core/technique";
import { GLDataType } from "../../webgl/shader-util";
import { AttributeUsage } from "../../webgl/attribute";
import { GLTextureType } from "../../webgl/uniform/uniform-texture";
import { ShaderFunction } from "../../shader-graph/shader-function";
import { texture, uniform, attribute } from "../../shader-graph/node-maker";


const tssaoBlend = new ShaderFunction({
  source: `
  vec4 tssaoBlend(
    vec3 color, 
    vec3 aocolor, 
    float sampleCount, 
    float tssaoComposeRate,
    float tssaoShowThreshold,
    float tssaoComposeThreshold
    ) {
    vec3 aoModify = vec3(1.0) - tssaoComposeRate * (vec3(1.0) - aocolor) * vec3(min(sampleCount / tssaoShowThreshold, 1.0));
    aoModify = clamp(aoModify + vec3(tssaoComposeThreshold), vec3(0.0), vec3(1.0));
    gl_FragColor = vec4(color * aoModify, 1.0);
  }
  `
})

export class TSSAOBlendTechnique extends Technique {
  // constructor() {
  //   super({
  //     attributes: [
  //       { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position },
  //       { name: 'uv', type: GLDataType.floatVec2, usage: AttributeUsage.uv },
  //     ],
  //     uniforms: [
  //       { name: 'u_tssaoComposeRate', default: 1.0, type: GLDataType.float },
  //       { name: 'u_tssaoComposeThreshold', default: 0.5, type: GLDataType.float },
  //       { name: 'u_tssaoShowThreshold', default: 200, type: GLDataType.float },
  //       { name: 'u_sampleCount', default: 0, type: GLDataType.float },
  //     ],
  //     varyings: [
  //       { name: 'v_uv', type: GLDataType.floatVec2 },
  //     ],
  //     textures: [
  //       { name: 'basic', type: GLTextureType.texture2D },
  //       { name: 'tssao', type: GLTextureType.texture2D },
  //     ],
  //     vertexShaderMain: vertexShaderSource,
  //     fragmentShaderMain: fragmentShaderSource,
  //   });
  // }

  update() {
    this.graph.reset()
    .setVertexRoot(attribute(
      { name: 'position', type: GLDataType.floatVec3, usage: AttributeUsage.position }
    ))
    .setVary("v_uv",attribute(
      { name: 'uv', type: GLDataType.floatVec2, usage: AttributeUsage.uv }
    ))
      .setFragmentRoot(
        tssaoBlend.make()
          .input("color", texture("basic").fetch(this.graph.getVary('uv')))
          .input("aocolor", texture("tssao").fetch(this.graph.getVary('uv')))
          .input('sampleCount', uniform("u_sampleCount", GLDataType.float))
          .input('tssaoComposeRate', uniform("u_tssaoComposeRate", GLDataType.float))
          .input('tssaoShowThreshold', uniform("u_tssaoShowThreshold", GLDataType.float))
          .input('tssaoComposeThreshold', uniform("u_tssaoComposeThreshold", GLDataType.float))
      )
  }

}