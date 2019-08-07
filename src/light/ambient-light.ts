import { ShaderFunction } from "../shader-graph/shader-function";
import { Light } from "../core/light";
import { MapUniform } from "../core/shading";
import { Vector3 } from "../math";
import { ShaderGraph } from "../shader-graph/shader-graph";

const ambientLightShading = new ShaderFunction({
  source:
    `
    vec4 ambientLight(
      vec3 color
      ){
        return vec4(color, 1.0);
    }
  `
})

export class AmbientLight extends Light<AmbientLight> {

  produceLightFragEffect(_decorated: ShaderGraph) {
    return ambientLightShading.make()
      .input("color", this.getPropertyUniform('color'))
  }

  @MapUniform("color")
  color: Vector3 = new Vector3(1, 1, 1)

}
