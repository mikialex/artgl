import { Light } from "../core/light";
import { Uniform } from "../core/shading";
import { Vector3 } from "../math";
import { ShaderGraph, NormalFragVary } from "../shader-graph/shader-graph";
import { ShaderNode } from '../shader-graph/shader-node';
import { ShadingComponent } from "../core/shading-decorator";

@ShadingComponent()
export class AmbientLight extends Light<AmbientLight> {

  produceLightFragDir(graph: ShaderGraph): ShaderNode {
    return graph.getVary(NormalFragVary)
  }
  produceLightIntensity(_graph: ShaderGraph): ShaderNode {
    return this.getPropertyUniform('color')
  }

  @Uniform("color")
  color: Vector3 = new Vector3(1, 1, 1)

}
