import {
  MarkNeedRedecorate, ShadingComponent, BaseEffectShading,
  ShadingUniform, Uncharted2ToneMapping, ReinhardToneMapping,
  ShaderGraph, vec4, constValue
} from "@artgl/core";
import {
  controlExposureShading, OptimizedCineonToneMapping,
  ACESFilmicToneMapping
} from "@artgl/shader-graph/src/built-in/tone-mapping";

export enum ToneMapType {
  Linear = "Linear",
  Uncharted2ToneMapping = "Uncharted2ToneMapping",
  ReinhardToneMapping = "ReinhardToneMapping",
  OptimizedCineonToneMapping = "OptimizedCineonToneMapping",
  ACESFilmicToneMapping = "ACESFilmicToneMapping"
}

@ShadingComponent()
export class ExposureController extends BaseEffectShading<ExposureController> {

  @ShadingUniform("toneMappingExposure")
  toneMappingExposure: number = 1 / 1;

  @ShadingUniform("toneMappingWhitePoint")
  toneMappingWhitePoint: number = 1;

  @MarkNeedRedecorate
  toneMapType: ToneMapType = ToneMapType.Uncharted2ToneMapping;

  getToneMapFunction() {
    switch (this.toneMapType) {

      case ToneMapType.Linear:
        return controlExposureShading.make()
          .input("toneMappingExposure", this.getPropertyUniform("toneMappingExposure"))

      case ToneMapType.Uncharted2ToneMapping:
        return Uncharted2ToneMapping.make()
          .input("toneMappingExposure", this.getPropertyUniform("toneMappingExposure"))
          .input("toneMappingWhitePoint", this.getPropertyUniform("toneMappingWhitePoint"))
      
      case ToneMapType.ReinhardToneMapping:
        return ReinhardToneMapping.make()
          .input("toneMappingExposure", this.getPropertyUniform("toneMappingExposure"))
      
      case ToneMapType.OptimizedCineonToneMapping:
        return OptimizedCineonToneMapping.make()
          .input("toneMappingExposure", this.getPropertyUniform("toneMappingExposure"))
      
      case ToneMapType.ACESFilmicToneMapping:
        return ACESFilmicToneMapping.make()
          .input("toneMappingExposure", this.getPropertyUniform("toneMappingExposure"))
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