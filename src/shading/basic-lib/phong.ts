import { BaseEffectShading, MapUniform, ShaderUniformProvider } from "../../core/shading";
import { ShaderGraph, NormalFragVary } from "../../shader-graph/shader-graph";
import { Light, collectLight } from "../../core/light";
import { ShaderFunction } from "../../shader-graph/shader-function";

const phongShading = new ShaderFunction({
  source: `
  vec4 phongShading(
    vec3 lightDir,
    vec4 lightIntensity,
    vec3 surfaceNormal,
    vec3 eyeDir,
    float shininess
    ){
      float lightNormalDot = dot(-lightDir,surfaceNormal);
      vec3 diffuseTerm = lightIntensity.xyz * max(lightNormalDot, 0.0);
      vec3 ReflectDir = normalize(reflect(lightDir, surfaceNormal));  
      vec3 specularTerm = lightIntensity.xyz * pow(max(dot(ReflectDir,-eyeDir),0.0),0.3*shininess);
      return vec4(diffuseTerm + specularTerm, 1.0);
  }
  `
})

export class PhongShading<T> extends BaseEffectShading<PhongShading<T>> {
  constructor(light: Light<T>) {
    super();
    this.light = light
  }

  decorate(graph: ShaderGraph): void {
    graph
      .setFragmentRoot(
        collectLight.make()
          .input("base", graph.getFragRoot())
          .input("light",
            phongShading.make()
            .input("lightDir", this.light.produceLightFragDir(graph))
            .input("lightIntensity", this.light.produceLightIntensity(graph))
            .input("surfaceNormal", graph.getVary(NormalFragVary))
            .input("eyeDir", graph.getEyeDir())
            .input("shininess", this.getPropertyUniform("shininess"))
          )
      )
  }

  foreachProvider(visitor: (p: ShaderUniformProvider) => any) {
    visitor(this);
    visitor(this.light);
  }

  light: Light<T>

  @MapUniform("shininess")
  shininess: number = 15;

}