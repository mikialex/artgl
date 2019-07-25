import { ShaderUniformProvider } from "../../core/shading";
import { texture, screenQuad } from "../../shader-graph/node-maker";
import { UvFragVary, ShaderGraph } from '../../shader-graph/shader-graph';

export class CopyShading implements ShaderUniformProvider {

  providerName: "CopyShading"

  decorate(graph: ShaderGraph) {
    graph.reset()
      .setVertexRoot(screenQuad())
      .declareFragUV()
      .setFragmentRoot(
        texture("copySource").fetch(graph.getVary(UvFragVary))
      )
  }

  uniforms = new Map()
}
