import { Shading } from "../../core/technique";
import { texture, screenQuad } from "../../shader-graph/node-maker";
import { UvFragVary } from '../../shader-graph/shader-graph';

export class CopyShading extends Shading {

  update() {
    this.graph.reset()
      .setVertexRoot(screenQuad())
      .declareFragUV()
      .setFragmentRoot(
        texture("copySource").fetch(this.graph.getVary(UvFragVary))
      )

  }
}