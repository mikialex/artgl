import { ShaderGraph, shader, BaseEffectShading, MVP } from "@artgl/core"
import { depthPack } from "@artgl/shader-graph/src/built-in/depth-pack"

const depthV = shader(`
float depthVary(vec4 worldPosition){
  return worldPosition.z / worldPosition.w;
}
`)

export class DepthShading extends BaseEffectShading<DepthShading> {

  decorate(graph: ShaderGraph): void {
    const { MVP: MVPResult } = MVP(graph)
    graph.setVertexRoot(MVPResult)
      .setVary("depth", depthV.make().input("worldPosition", MVPResult))
      .setFragmentRoot(
        depthPack.make().input("frag_depth", graph.getVary("depth"))
      )
  }

}