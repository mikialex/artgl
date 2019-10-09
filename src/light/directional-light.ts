import { Light } from "../core/light";
import { ShaderGraph, ShaderNode } from "../artgl";
import { MapUniform } from "../core/shading";
import { Vector3 } from "../math";


export class DirectionalLight extends Light<DirectionalLight> {

  produceLightFragDir(_graph: ShaderGraph): ShaderNode {
    return this.getPropertyUniform("direction")
  }
  produceLightIntensity(_graph: ShaderGraph): ShaderNode {
    return this.getPropertyUniform("color")
  }

  @MapUniform("u_directionalLight_color")
  color: Vector3 = new Vector3(1, 1, 1)

  @MapUniform("u_directionalLight_direction")
  direction: Vector3 = new Vector3(1, 1, 1).normalize()

}
