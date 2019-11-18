import {
  ShaderFunction, BaseEffectShading, ShaderGraph, ShadingComponent,
  ShaderTextureNode, NormalFragVary, CubeTexture, ShadingTexture
} from "@artgl/core";
import { sampleEnvMapAndNeedNormalize } from "./cube-env-map";

const reflect = new ShaderFunction({
  source:
    `vec3 reflect_wrapper(vec3 eyeToSurfaceDir, vec3 normal){
      return reflect(eyeToSurfaceDir, normal);
    }`
})

@ShadingComponent()
export class IBLEnvMap extends BaseEffectShading<IBLEnvMap> {

  static produceIBLEnvMapColor(graph: ShaderGraph, envMapTexture: ShaderTextureNode) {
    return sampleEnvMapAndNeedNormalize.make()
      .input("envMap", envMapTexture)
      .input("dir",
        reflect.make()
          .input('eyeToSurfaceDir', graph.getEyeDir())
          .input('normal', graph.getVary(NormalFragVary))
      )
  }

  decorate(graph: ShaderGraph): void {
    graph
      .setFragmentRoot(
        IBLEnvMap.produceIBLEnvMapColor(graph, this.getPropertyTexture('envMap'))
      )
  }

  @ShadingTexture('envMap')
  envMap: CubeTexture = new CubeTexture();

}