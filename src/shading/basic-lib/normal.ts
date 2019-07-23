import { Shading } from "../../core/technique";
import { MVPWorld } from "../../shader-graph/node-maker";
import { ShaderFunction } from "../../shader-graph/shader-function";
import { NormalFragVary } from "../../shader-graph/shader-graph";


const normalShading = new ShaderFunction({
  source:
    `vec4 normalShading(vec3 normal){
      return vec4(normal * 0.5 + 0.5, 1.0);
    }`
})

export class NormalShading extends Shading {

  update() {
    this.graph.reset()
      .setVertexRoot(MVPWorld())
      .declareFragNormal()
      .setFragmentRoot(
        normalShading.make().input("normal", this.graph.getVary(NormalFragVary))
      )
  }

}