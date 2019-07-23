import { Shading } from "../../core/technique";
import { MVPWorld } from "../../shader-graph/node-maker";
import { ShaderFunction } from "../../shader-graph/shader-function";
import { depthPack } from "../../shader-graph/built-in/depth-pack";


const depthV = new ShaderFunction(
  {
    source: `
    float depthVary(vec4 worldPosition){
      return worldPosition.z / worldPosition.w;
    }
    `}
)

export class DepthShading extends Shading {
  name = "drawDepth"

  update() {
    const worldPosition = MVPWorld()

    this.graph.reset()
      .setVertexRoot(worldPosition)
      .setVary("depth", depthV.make().input("worldPosition", worldPosition))
      .setFragmentRoot(
        depthPack.make().input("frag_depth", this.graph.getVary("depth"))
      )
  }

}