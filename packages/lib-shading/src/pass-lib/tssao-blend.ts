import {
  BaseEffectShading, ShaderFunction, ShadingComponent,
  ShadingUniform, ShaderGraph, screenQuad, texture, UvFragVary
} from "@artgl/core";


const tssaoBlend = new ShaderFunction({
  source: `
  vec4 tssaoBlend(
    sampler2D colorMap, 
    sampler2D aoMap, 
    vec2 uvInput,
    float sampleCount, 
    float tssaoComposeRate,
    float tssaoShowThreshold,
    float tssaoComposeThreshold
    ) {
      vec3 color = texture2D(colorMap, uvInput).xyz;
      vec3 aoColor = texture2D(aoMap, uvInput).xyz;
      vec3 aoModify = vec3(1.0) - tssaoComposeRate * (vec3(1.0) - aoColor) * vec3(min(sampleCount / tssaoShowThreshold, 1.0));
      aoModify = clamp(aoModify + vec3(tssaoComposeThreshold), vec3(0.0), vec3(1.0));
      return vec4(color * aoModify, 1.0);
  }
  `
})

@ShadingComponent()
export class TSSAOBlendShading extends BaseEffectShading<TSSAOBlendShading> {

  @ShadingUniform("u_sampleCount")
  sampleCount: number = 0;

  @ShadingUniform("u_tssaoComposeRate")
  tssaoComposeRate: number = 1;

  @ShadingUniform("u_tssaoShowThreshold")
  tssaoShowThreshold: number = 200;

  @ShadingUniform("u_tssaoComposeThreshold")
  tssaoComposeThreshold: number = 0.5;

  decorate(graph: ShaderGraph) {
    graph
      .setVertexRoot(screenQuad(graph))
      .setFragmentRoot(
        tssaoBlend.make()
          .input("colorMap", texture("basic"))
          .input("aoMap", texture("tssao"))
          .input("uvInput", graph.getVary(UvFragVary))
          .input('sampleCount', this.getPropertyUniform('sampleCount'))
          .input('tssaoComposeRate', this.getPropertyUniform('tssaoComposeRate'))
          .input('tssaoShowThreshold', this.getPropertyUniform('tssaoShowThreshold'))
          .input('tssaoComposeThreshold', this.getPropertyUniform('tssaoComposeThreshold'))
      )
  }



}