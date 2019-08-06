import { BaseEffectShading, MapUniform } from "../../core/shading";
import { ShaderFunction } from "../../shader-graph/shader-function";
import { ShaderGraph } from "../../shader-graph/shader-graph";
import { vec4, constValue } from "../../shader-graph/node-maker";

const controlExposureShading = new ShaderFunction({
  source:
    `vec3 LinearToneMapping(vec3 intensity, float toneMappingExposure){
      return toneMappingExposure * intensity;
    }`
})

export class ExposureController extends BaseEffectShading<ExposureController> {
  
  @MapUniform("toneMappingExposure")
  toneMappingExposure: number = 1 / 1;

  decorate(graph: ShaderGraph): void {
    graph
      .declareFragNormal()
      .setFragmentRoot(
        vec4(
          controlExposureShading.make()
            .input("intensity", graph.getFragRoot().swizzling("xyz"))
            .input("toneMappingExposure", this.getPropertyUniform("toneMappingExposure")),
          constValue(1)
        )
        
      )
  }

}