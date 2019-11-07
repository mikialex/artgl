import { BaseEffectShading } from "../../core/shading";
import { texture, screenQuad } from "../../shader-graph/node-maker";
import { UvFragVary, ShaderGraph } from '../../shader-graph/shader-graph';

export class CopyShading extends BaseEffectShading<CopyShading> {

  decorate(graph: ShaderGraph) {
    graph
      .setVertexRoot(screenQuad(graph))
      .setFragmentRoot(
        texture("copySource").fetch(graph.getVary(UvFragVary))
      )
  }

}
