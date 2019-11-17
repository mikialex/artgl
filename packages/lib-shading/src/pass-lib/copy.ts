import {
  ShaderGraph, screenQuad, BaseEffectShading,
  texture, UvFragVary
} from "@artgl/core";


export class CopyShading extends BaseEffectShading<CopyShading> {

  decorate(graph: ShaderGraph) {
    graph
      .setVertexRoot(screenQuad(graph))
      .setFragmentRoot(
        texture("copySource").fetch(graph.getVary(UvFragVary))
      )
  }

}
