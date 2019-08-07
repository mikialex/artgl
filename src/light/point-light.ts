import { ShaderFunction } from "../shader-graph/shader-function";
import { Light } from "../core/light";
import { WorldPositionFragVary, NormalFragVary, ShaderGraph } from "../shader-graph/shader-graph";
import { MapUniform } from "../core/shading";
import { Vector3 } from "../math";

const pointLightShading = new ShaderFunction({
  source:
    `
    vec4 pointLight(
      vec3 fragPosition,
      vec3 fragNormal,
      vec3 lightPosition, 
      vec3 color,
      float radius ){
        float distance = length(fragPosition - lightPosition);
        if( distance < radius){
          return vec4(color * (1.0 - distance / radius), 0.0);
        }
        return vec4(0.0);
    }
  `
})

export class PointLight extends Light<PointLight> {

  produceLightFragEffect(decorated: ShaderGraph) {
    return pointLightShading.make()
      .input("fragPosition", decorated.getVary(WorldPositionFragVary))
      .input("fragNormal", decorated.getVary(NormalFragVary))
      .input("lightPosition", this.getPropertyUniform('position'))
      .input("color", this.getPropertyUniform('color'))
      .input("radius", this.getPropertyUniform('radius'))
  }

  @MapUniform("u_pointLight_color")
  color: Vector3 = new Vector3(1, 1, 1)

  // TODO bind this to scene node transformation
  @MapUniform("u_pointLight_lightPosition")
  position: Vector3 = new Vector3(0, 0, 0)

  @MapUniform("u_pointLight_lightRadius")
  radius: number = 3
}
