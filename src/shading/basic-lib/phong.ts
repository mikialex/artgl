import { BaseEffectShading, MapUniform, ShaderUniformProvider } from "../../core/shading";
import { ShaderGraph, NormalFragVary } from "../../shader-graph/shader-graph";
import { Light, collectLightNodes } from "../../core/light";
import { ShaderFunction } from "../../shader-graph/shader-function";

const phongShading = new ShaderFunction({
  source: `
  vec3 phongShading(
    vec3 lightDir,
    vec3 lightIntensity,
    vec3 surfaceNormal,
    vec3 eyeDir,
    float shininess
    ){
      float lightNormalDot = dot(-lightDir,surfaceNormal);
      vec3 diffuseTerm = lightIntensity.xyz * max(lightNormalDot, 0.0);
      vec3 ReflectDir = normalize(reflect(lightDir, surfaceNormal));  
      vec3 specularTerm = lightIntensity.xyz * pow(max(dot(ReflectDir,-eyeDir),0.0),0.3*shininess);
      return diffuseTerm + specularTerm;
  }
  `
})

export class PhongShading<T> extends BaseEffectShading<PhongShading<T>> {
  constructor(lights: Array<Light<T>>) {
    super();
    this.lights = lights
  }

  decorate(graph: ShaderGraph): void {
    graph.setFragmentRoot(
      collectLightNodes<T>(this.lights,
        (light) => {
        return phongShading.make()
        .input("lightDir", light.produceLightFragDir(graph))
        .input("lightIntensity", light.produceLightIntensity(graph))
        .input("surfaceNormal", graph.getVary(NormalFragVary))
        .input("eyeDir", graph.getEyeDir())
        .input("shininess", this.getPropertyUniform("shininess"))
      })
    )
  }

  foreachProvider(visitor: (p: ShaderUniformProvider) => any) {
    visitor(this);
    this.lights.forEach(light => {
      visitor(light);
    })
  }

  lights: Array<Light<T>>

  @MapUniform("shininess")
  shininess: number = 15;

}