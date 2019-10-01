import { BaseEffectShading } from "../../core/shading";
import { shader } from "../../shader-graph/shader-function";
import { depthPack } from "../../shader-graph/built-in/depth-pack";
import { ShaderGraph } from "../../shader-graph/shader-graph";
import { MVP } from "../../core/camera";

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