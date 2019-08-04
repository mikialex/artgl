import { BaseEffectShading } from "../../core/shading";
import { GLDataType } from "../../webgl/shader-util";
import { uniform } from "../../shader-graph/node-maker";
import { ShaderGraph } from "../../shader-graph/shader-graph";

export class PureShading extends BaseEffectShading<PureShading> {

  decorate(graph: ShaderGraph) {
    graph
      .setFragmentRoot(uniform("baseColor", GLDataType.floatVec4))
  }

}