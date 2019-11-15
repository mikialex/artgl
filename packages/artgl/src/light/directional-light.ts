import { Light } from "../core/light";
import { ShaderGraph, ShaderNode } from "../artgl";
import { Uniform } from "../core/shading";
import { Vector3 } from "@artgl/math";
import { ShadingComponent } from "../core/shading-decorator";


@ShadingComponent()
export class DirectionalLight extends Light<DirectionalLight> {

  produceLightFragDir(_graph: ShaderGraph): ShaderNode {
    return this.getPropertyUniform("direction")
  }
  produceLightIntensity(_graph: ShaderGraph): ShaderNode {
    return this.getPropertyUniform("color")
  }

  @Uniform("u_directionalLight_color")
  color: Vector3 = new Vector3(1, 1, 1)

  @Uniform("u_directionalLight_direction")
  direction: Vector3 = new Vector3(1, 1, 1).normalize()

}
