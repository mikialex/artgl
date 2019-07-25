import { ShaderUniformProvider } from "../../core/shading";
import { MVPWorld } from "../../shader-graph/node-maker";
import { ShaderFunction } from "../../shader-graph/shader-function";
import { depthPack } from "../../shader-graph/built-in/depth-pack";
import { ShaderGraph } from "../../shader-graph/shader-graph";


const depthV = new ShaderFunction(
  {
    source: `
    float depthVary(vec4 worldPosition){
      return worldPosition.z / worldPosition.w;
    }
    `}
)

export class DepthShading implements ShaderUniformProvider {

  decorate(graph: ShaderGraph): void {
    const worldPosition = MVPWorld()
    graph.setVertexRoot(worldPosition)
      .setVary("depth", depthV.make().input("worldPosition", worldPosition))
      .setFragmentRoot(
        depthPack.make().input("frag_depth", graph.getVary("depth"))
      )
  }

  uniforms = new Map();

  providerName = "drawDepth"

}