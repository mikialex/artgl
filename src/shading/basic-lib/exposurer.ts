import { BaseEffectShading, MapUniform, MarkNeedRedecorate } from "../../core/shading";
import { ShaderFunction } from "../../shader-graph/shader-function";
import { ShaderGraph } from "../../shader-graph/shader-graph";
import { vec4, constValue } from "../../shader-graph/node-maker";

const controlExposureShading = new ShaderFunction({
  source:
    `vec3 LinearToneMapping(vec3 intensity, float toneMappingExposure){
      return toneMappingExposure * intensity;
    }`
})

const Uncharted2Helper = new ShaderFunction({
  source:
    `
    vec3 Uncharted2Helper(vec3 x){
      return max(((x * (0.15 * x + 0.10 * 0.50 ) + 0.20 * 0.02) / (x * (0.15 * x + 0.50) + 0.20 * 0.30)) - 0.02/0.30, vec3(0.0));
    }
    `
})

const Uncharted2ToneMapping = new ShaderFunction({
  source:
    `
    vec3 Uncharted2ToneMapping(
      vec3 intensity, 
      float toneMappingExposure,
      float toneMappingWhitePoint
      ) {
        intensity *= toneMappingExposure;
        return Uncharted2Helper(intensity) / Uncharted2Helper(vec3(toneMappingWhitePoint));
    }
    `,
  description: `John Hable's filmic operator from Uncharted 2 video game`,
  dependFunction: [Uncharted2Helper]
})

export enum ToneMapType {
  Linear = "Linear",
  Uncharted2ToneMapping= "Uncharted2ToneMapping",

}

console.log(ToneMapType);

export class ExposureController extends BaseEffectShading<ExposureController> {

  @MapUniform("toneMappingExposure")
  toneMappingExposure: number = 1 / 1;

  @MapUniform("toneMappingWhitePoint")
  toneMappingWhitePoint: number = 1;

  @MarkNeedRedecorate()
  toneMapType: ToneMapType = ToneMapType.Uncharted2ToneMapping;

  getToneMapFunction() {
    switch (this.toneMapType) {

      case ToneMapType.Linear:
         return  controlExposureShading.make()
          .input("toneMappingExposure", this.getPropertyUniform("toneMappingExposure"))
      
      case ToneMapType.Uncharted2ToneMapping:
          return  Uncharted2ToneMapping.make()
            .input("toneMappingExposure", this.getPropertyUniform("toneMappingExposure"))
            .input("toneMappingWhitePoint", this.getPropertyUniform("toneMappingWhitePoint"))
    }
  }

  decorate(graph: ShaderGraph): void {
    graph
      .setFragmentRoot(
        vec4(
          this.getToneMapFunction()
            .input("intensity", graph.getFragRoot().swizzling("xyz")),
          constValue(1)
        )
      )
  }

}