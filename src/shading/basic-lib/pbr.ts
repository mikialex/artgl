import { ShaderFunction } from "../../shader-graph/shader-function";
import { BaseEffectShading } from "../../core/shading";
import { ShaderGraph } from "../../artgl";
import { NormalFragVary } from "../../shader-graph/shader-graph";
import { PointLight } from "../../light/exports";

const normalShading = new ShaderFunction({
  source:
    `vec4 normalShading(vec3 normal){
      return vec4(normal * 0.5 + 0.5, 1.0);
    }`
})

export class PBRShading extends BaseEffectShading<PBRShading | PointLight> {

  pointLight: PointLight

  registerProvider() {
    return [this, this.pointLight];
  }


  decorate(graph: ShaderGraph): void {
    // graph
    //   .setFragmentRoot(
    //     normalShading.make()
    //       .input("normal", graph.getVary(NormalFragVary))
    //       .input()
    //   )
  }

}  

export class StandardShading extends BaseEffectShading<StandardShading> { 

  

  decorate(graph: ShaderGraph): void {
    // graph
    //   .setFragmentRoot(
    //     normalShading.make()
    //       .input("normal", graph.getVary(NormalFragVary))
    //       .input()
    //   )
  }
}