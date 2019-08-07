import { ShaderFunction } from "../shader-graph/shader-function";
import { Light } from "../core/light";
import { ShaderGraph } from "../artgl";
import { WorldPositionFragVary, NormalFragVary } from "../shader-graph/shader-graph";
import { MapUniform } from "../core/shading";
import { Vector3 } from "../math";

const directionalLightShading = new ShaderFunction({
  source:
    `
    vec4 dirLight(
      vec3 fragPosition,
      vec3 fragNormal,
      vec3 lightDirection, 
      vec3 color
      ){
        float light = max(0.0, dot(fragNormal, lightDirection));
        return vec4(light * color, 1.0);
    }
  `
})


export class DirectionalLight extends Light<DirectionalLight> {

  produceLightFragEffect(decorated: ShaderGraph) {
    return directionalLightShading.make()
      .input("fragPosition", decorated.getVary(WorldPositionFragVary))
      .input("fragNormal", decorated.getVary(NormalFragVary))
      .input("lightDirection", this.getPropertyUniform('direction'))
      .input("color", this.getPropertyUniform('color'))
  }

  @MapUniform("u_directionalLight_color")
  color: Vector3 = new Vector3(1, 1, 1)

  @MapUniform("u_directionalLight_direction")
  direction: Vector3 = new Vector3(1, 1, 1).normalize()

}
