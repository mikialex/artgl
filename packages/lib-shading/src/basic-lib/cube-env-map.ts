import { shader } from "../../shader-graph/shader-function"
import { BaseEffectShading, ShaderGraph, WorldPositionFragVary } from "../../artgl"
import { CubeTexture } from "../../core/render-entity/texture-cube"
import { ShadingComponent, Texture } from "../../core/shading-decorator"

export const sampleEnvMapAndNeedNormalize = shader(`
vec4 sampleEnvMap(samplerCube envMap, vec3 dir){
  return textureCube(envMap, normalize(dir));
}
`)

@ShadingComponent()
export class CubeEnvMapShading extends BaseEffectShading<CubeEnvMapShading> {

  decorate(graph: ShaderGraph): void {
    graph
      .setFragmentRoot(
        sampleEnvMapAndNeedNormalize.make()
          .input("envMap", this.getPropertyTexture('envMap'))
          .input("dir", graph.getVary(WorldPositionFragVary))
      )
  }

  @Texture('envMap')
  envMap: CubeTexture = new CubeTexture();

}