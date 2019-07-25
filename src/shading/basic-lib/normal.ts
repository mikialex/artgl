import { ShaderUniformProvider } from "../../core/shading";
import { MVPWorld } from "../../shader-graph/node-maker";
import { ShaderFunction } from "../../shader-graph/shader-function";
import { NormalFragVary, ShaderGraph } from "../../shader-graph/shader-graph";


const normalShading = new ShaderFunction({
  source:
    `vec4 normalShading(vec3 normal){
      return vec4(normal * 0.5 + 0.5, 1.0);
    }`
})

export class NormalShading implements ShaderUniformProvider {

  decorate(graph: ShaderGraph): void {
    graph.reset()
      .setVertexRoot(MVPWorld())
      .declareFragNormal()
      .setFragmentRoot(
        normalShading.make().input("normal", graph.getVary(NormalFragVary))
      )
  }

  uniforms = new Map();

  providerName = "NormalShading"

}