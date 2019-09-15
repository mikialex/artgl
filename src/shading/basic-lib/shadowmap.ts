import { BaseEffectShading, MapUniform, ShaderUniformProvider } from "../../core/shading";
import { ShaderGraph, WorldPositionFragVary } from "../../shader-graph/shader-graph";
import { ShaderFunction } from "../../shader-graph/shader-function";
import { DirectionalShadowMap } from "../../shadow-map/directional-shadowmap";

const addShadow = new ShaderFunction({
  source: `
  vec4 addShadow(
    vec3 worldPosition,
    sampler2D shadowMap, 
    mat4 shadowMatrix,
    vec4 inputColor,
    ){
      return inputColor;
  }
  `
})

export function uploadTextureUseFBOKey() {
  
}

export class ShadowMap extends BaseEffectShading<ShadowMap> {
  constructor(shadowMap: DirectionalShadowMap) {
    super();
    this.shadowMap = shadowMap;
  }

  decorate(graph: ShaderGraph): void {
    graph.setFragmentRoot(
      addShadow.make()
      .input('worldPosition', graph.getVary(WorldPositionFragVary))
      .input('shadowMap', )
      .input('shadowMatrix', )
      .input('inputColor', graph.getFragRoot())
    )
  }

  foreachProvider(visitor: (p: ShaderUniformProvider) => any) {
    visitor(this.shadowMap);
  }

  shadowMap: DirectionalShadowMap

}