import { SceneNode } from "../scene/scene-node";
import { Vector3 } from '../math/vector3';
import { ShaderGraph, NormalFragVary, WorldPositionFragVary } from "../shader-graph/shader-graph";
import { ShaderFunction } from "../shader-graph/shader-function";
import { uniformFromValue } from "../shader-graph/node-maker";
import { ShaderUniformProvider, MapUniform } from "./shading";
import { ShaderCommonUniformInputNode } from "../shader-graph/shader-node";

// TODO I cant figure out right multi inheritance impl with strong type, code duplicate 

export class Light<T> extends SceneNode implements ShaderUniformProvider {
  constructor() {
    super();
    // need check if has initialized by decorator
    if (this.uniforms === undefined) {
      this.uniforms = new Map();
    }
    if (this.propertyUniformNameMap === undefined) {
      this.propertyUniformNameMap = new Map();
    }
  }

  decorate(_graph: ShaderGraph): void {
    throw new Error("Method not implemented.");
  }

  hasAnyUniformChanged: boolean;

  uniforms: Map<string, any>;

  propertyUniformNameMap: Map<string, string>;

  getPropertyUniform(name: keyof T): ShaderCommonUniformInputNode {
    const uniformName = this.propertyUniformNameMap.get(name as string);
    const value = this[name as string];
    if (value === undefined) {
      throw "uniform value not given"
    }
    return uniformFromValue(uniformName, value);
  }
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
        float distance = length(fragPosition - lightPosition);
        if( distance < radius){
          return vec4(color * (1.0 - distance / radius), 0.0);
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

export class PointLight extends Light<PointLight> {

  decorate(decorated: ShaderGraph) {
    decorated
      .setFragmentRoot(
        AddCompose.make()
          .input("base", decorated.getFragRoot())
          .input("light", pointLightShading.make()
            .input("fragPosition", decorated.getVary(WorldPositionFragVary))
            .input("FragNormal", decorated.getVary(NormalFragVary))
            .input("lightPosition", this.getPropertyUniform('position'))
            .input("color", this.getPropertyUniform('color'))
            .input("radius", this.getPropertyUniform('radius'))
          )
      )
  }

  @MapUniform("lightColor")
  color: Vector3 = new Vector3(1, 1, 1)

  @MapUniform("lightPosition")
  position: Vector3 = new Vector3(0, 0, 0)

  @MapUniform("lightRadius")
  radius: number = 3
}
