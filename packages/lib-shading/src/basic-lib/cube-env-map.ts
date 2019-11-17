import {
  ShaderGraph, ShadingComponent, shader,
  BaseEffectShading, WorldPositionFragVary,
  ShadingTexture, CubeTexture
} from "@artgl/core";


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

  @ShadingTexture('envMap')
  envMap: CubeTexture = new CubeTexture();

}