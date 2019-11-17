
import { Light } from "../core/light";
import { Vector3 } from "@artgl/math";
import { ShadingComponent, ShadingUniform } from "../core/shading-decorator";
import { ShaderFunction, ShaderGraph, ShaderNode, WorldPositionFragVary } from "@artgl/shader-graph";
import { dir3D } from "@artgl/shader-graph/src/built-in/transform";

const pointLightShading = new ShaderFunction({
  source:
    `
    vec3 pointLight(
      vec3 fragPosition,
      vec3 lightPosition, 
      vec3 color,
      float radius ){
        float distance = length(fragPosition - lightPosition);
        if( distance < radius){
          return color * (1.0 - distance / radius);
        }
        return vec3(0.0);
    }
  `
})


@ShadingComponent()
export class PointLight extends Light<PointLight> {

  produceLightFragDir(graph: ShaderGraph): ShaderNode {
    return dir3D.make()
      .input("from", this.getPropertyUniform('position'))
      .input("to", graph.getVary(WorldPositionFragVary))
  }
  produceLightIntensity(graph: ShaderGraph): ShaderNode {
    return pointLightShading.make()
      .input("fragPosition", graph.getVary(WorldPositionFragVary))
      .input("lightPosition", this.getPropertyUniform('position'))
      .input("color", this.getPropertyUniform('color'))
      .input("radius", this.getPropertyUniform('radius'))
  }

  @ShadingUniform("u_pointLight_color")
  color: Vector3 = new Vector3(1, 1, 1)

  // TODO bind this to scene node transformation
  @ShadingUniform("u_pointLight_lightPosition")
  position: Vector3 = new Vector3(0, 0, 0)

  @ShadingUniform("u_pointLight_lightRadius")
  radius: number = 3
}
