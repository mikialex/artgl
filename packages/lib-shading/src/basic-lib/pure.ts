import {
  ShadingUniform, ShadingComponent, BaseEffectShading,
  Vector4, ShaderGraph
} from "@artgl/core";


@ShadingComponent()
export class PureShading extends BaseEffectShading<PureShading> {

  
  @ShadingUniform("baseColor")
  color = new Vector4(0.2, 0.4, 0.6, 1.0);

  decorate(graph: ShaderGraph) {
    graph
      .setFragmentRoot(this.getPropertyUniform('color'))
  }

}