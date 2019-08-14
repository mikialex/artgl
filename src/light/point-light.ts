import { ShaderFunction } from "../shader-graph/shader-function";
import { Light } from "../core/light";
import { WorldPositionFragVary, NormalFragVary, ShaderGraph } from "../shader-graph/shader-graph";
import { MapUniform } from "../core/shading";
import { Vector3 } from "../math";
import { ShaderNode } from '../shader-graph/shader-node';
import { dir3D } from '../shader-graph/built-in/transform';

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


export class PointLight extends Light<PointLight> {

  produceDefaultLightFragEffect(decorated: ShaderGraph) {
    return pointLightShading.make()
      .input("fragPosition", decorated.getVary(WorldPositionFragVary))
      .input("lightPosition", this.getPropertyUniform('position'))
      .input("color", this.getPropertyUniform('color'))
      .input("radius", this.getPropertyUniform('radius'))
  }

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

  @MapUniform("u_pointLight_color")
  color: Vector3 = new Vector3(1, 1, 1)

  // TODO bind this to scene node transformation
  @MapUniform("u_pointLight_lightPosition")
  position: Vector3 = new Vector3(0, 0, 0)

  @MapUniform("u_pointLight_lightRadius")
  radius: number = 3
}
