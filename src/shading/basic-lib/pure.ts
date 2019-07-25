import { Shading } from "../../core/shading";
import { GLDataType } from "../../webgl/shader-util";
import { uniform, MVPWorld } from "../../shader-graph/node-maker";

export class PureShading extends Shading {

  update() {
    this.graph.reset()
      .setVertexRoot(MVPWorld())
      .setFragmentRoot(uniform("baseColor", GLDataType.floatVec4))
    
  }

}