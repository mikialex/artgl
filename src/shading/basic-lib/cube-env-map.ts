import { shader } from "../../shader-graph/shader-function"
import { BaseEffectShading, ShaderGraph, WorldPositionFragVary } from "../../artgl"
import { CubeTexture } from "../../core/texture-cube"
import { MapUniform } from "../../core/shading"

export const sampleEnvMapAndNeedNormalize = shader(`
vec4 sampleEnvMap(samplerCube envMap, vec3 dir){
  return textureCube(envMap, normalize(dir));
}
`)

export class CubeEnvMapShading extends BaseEffectShading<CubeEnvMapShading> {

  decorate(graph: ShaderGraph): void {
    graph
      .setFragmentRoot(
        sampleEnvMapAndNeedNormalize.make()
          .input("envMap", this.getPropertyTexture('envMap'))
          .input("dir", graph.getVary(WorldPositionFragVary))
      )
  }

  @MapUniform('envMap')
  envMap: CubeTexture = new CubeTexture();

}