import { BaseEffectShading, Uniform } from "../../core/shading";
import { ShaderGraph } from "../../shader-graph/shader-graph";
import { Vector4 } from "@artgl/math";
import { ShadingComponent } from "../../core/shading-decorator";

@ShadingComponent()
export class PureShading extends BaseEffectShading<PureShading> {

  
  @Uniform("baseColor")
  color = new Vector4(0.2, 0.4, 0.6, 1.0);

  decorate(graph: ShaderGraph) {
    graph
      .setFragmentRoot(this.getPropertyUniform('color'))
  }

}