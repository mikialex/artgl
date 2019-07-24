import { SceneNode } from "../scene/scene-node";
import { Vector3 } from '../math/vector3';
import { ShaderGraph, ShaderGraphDecorator, NormalFragVary, WorldPositionFragVary } from "../shader-graph/shader-graph";
import { ShaderFunction } from "../shader-graph/shader-function";
import { uniform } from "../shader-graph/node-maker";
import { GLDataType } from "../webgl/shader-util";


export class Light extends SceneNode {
  shader: ShaderGraphDecorator
}


const pointLightShading = new ShaderFunction({
  source:
    `
    vec4 pointLight(
      vec3 fragPosition,
      vec3 FragNormal,
      vec3 lightPosition, 
      vec3 color,
      float radius ){
        if(length(fragPosition - lightPosition) < radius){
          return vec4(color, 0.0);
        }
        return vec4(0.0);
    }
  `
})

const AddCompose = new ShaderFunction({
  source: `
  vec4 add(
    vec4 base,
    vec4 light){
      return base + light;
  }
  `
});

export class PointLightDecorator extends ShaderGraphDecorator {
  decorate(decorated: ShaderGraph) {
    decorated
      .setFragmentRoot(
        AddCompose.make()
          .input("base", decorated.getFragRoot())
          .input("light", pointLightShading.make()
            .input("fragPosition", decorated.getVary(WorldPositionFragVary))
            .input("FragNormal", decorated.getVary(NormalFragVary))
            .input("lightPosition", uniform("lightPosition", GLDataType.floatVec3).default(new Vector3()))
            .input("color", uniform("lightColor", GLDataType.floatVec3).default(new Vector3(1, 1, 1)))
            .input("radius", uniform("lightRadius", GLDataType.float).default(3))))
  }
}

export class PointLight extends Light {
  decorator = new PointLightDecorator();

  color: Vector3
  position: Vector3
  radius: Vector3
}


// export class DirectionalLight extends Light {
//   update() {

//   }

//   direction: Vector3
//   color: Vector3
// }
