import { BaseEffectShading, MapUniform } from "../../core/shading";
import { ShaderFunction } from "../../shader-graph/shader-function";
import { NormalFragVary, ShaderGraph } from "../../shader-graph/shader-graph";
import { CubeTexture } from "../../artgl";
import { sampleEnvMapAndNeedNormalize } from "./cube-env-map";
import { ShaderTextureNode } from "../../shader-graph/shader-node";
import { ShadingComponent } from "../../core/shading-util";

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

  @MapUniform('envMap')
  envMap: CubeTexture = new CubeTexture();

}