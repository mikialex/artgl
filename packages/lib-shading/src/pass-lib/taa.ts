import {
  ShadingComponent, ShaderFunction, BaseEffectShading,
  ShadingUniform, ShaderGraph, screenQuad, UvFragVary, texture
} from "@artgl/core";


const TAAMix = new ShaderFunction({
  source:
    `
  vec4 TAAMix (vec3 oldColor, vec3 newColor, float sampleCount){
    float rate = 0.05;
    // return vec4(newColor * rate + (1.0 - rate) * oldColor, 1.0);
    
    return vec4((oldColor * sampleCount + newColor) / (sampleCount + 1.0), 1.0);
  }
    `
})

@ShadingComponent()
export class TAAShading extends BaseEffectShading<TAAShading> {

  @ShadingUniform("u_sampleCount")
  sampleCount: number = 0;

  decorate(graph: ShaderGraph) {
    graph
      .setVertexRoot(screenQuad(graph))

    const vUV = graph.getVary(UvFragVary);
    const colorOld = texture("TAAHistoryOld").fetch(vUV)
    graph.setFragmentRoot(
      TAAMix.make()
        .input("oldColor", colorOld.swizzling("xyz"))
        .input("newColor", texture("sceneResult").fetch(vUV).swizzling("xyz"))
        .input("sampleCount", this.getPropertyUniform("sampleCount"))
    )

  }

}