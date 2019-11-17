import { Light } from "../core/light";
import { Vector3 } from "@artgl/math";
import { ShadingComponent, ShadingUniform } from "../core/shading-decorator";
import { ShaderGraph, ShaderNode, NormalFragVary } from "@artgl/shader-graph";

@ShadingComponent()
export class AmbientLight extends Light<AmbientLight> {

  produceLightFragDir(graph: ShaderGraph): ShaderNode {
    return graph.getVary(NormalFragVary)
  }
  produceLightIntensity(_graph: ShaderGraph): ShaderNode {
    return this.getPropertyUniform('color')
  }

  @ShadingUniform("color")
  color: Vector3 = new Vector3(1, 1, 1)

}
