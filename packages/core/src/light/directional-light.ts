import { Light } from "../core/light";
import { Vector3 } from "@artgl/math";
import { ShadingComponent, ShadingUniform } from "../core/shading-decorator";
import { ShaderGraph, ShaderNode } from "@artgl/shader-graph";


@ShadingComponent()
export class DirectionalLight extends Light<DirectionalLight> {

  produceLightFragDir(_graph: ShaderGraph): ShaderNode {
    return this.getPropertyUniform("direction")
  }
  produceLightIntensity(_graph: ShaderGraph): ShaderNode {
    return this.getPropertyUniform("color")
  }

  @ShadingUniform("u_directionalLight_color")
  color: Vector3 = new Vector3(1, 1, 1)

  @ShadingUniform("u_directionalLight_direction")
  direction: Vector3 = new Vector3(1, 1, 1).normalize()

}
