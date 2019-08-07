import { BaseEffectShading } from "../../core/shading";
import { ShaderFunction } from "../../shader-graph/shader-function";
import { NormalFragVary, ShaderGraph } from "../../shader-graph/shader-graph";

const normalShading = new ShaderFunction({
  source:
    `vec4 normalShading(vec3 normal){
      return vec4(normal * 0.5 + 0.5, 1.0);
    }`
})

export class NormalShading extends BaseEffectShading<NormalShading> {

  decorate(graph: ShaderGraph): void {
    graph
      .setFragmentRoot(
        normalShading.make().input("normal", graph.getVary(NormalFragVary))
      )
  }

}