import { BaseEffectShading } from "../../core/shading";
import { ShaderGraph, NormalFragVary } from "../../shader-graph/shader-graph";
import { Light, collectLight } from "../../core/light";
import { ShaderFunction } from "../../shader-graph/shader-function";

const phongShading = new ShaderFunction({
  source: `
  phongShading(
    vec3 lightDir,
    vec4 lightIntensity,
    vec3 surfaceNormal,
    vec3 eyeDir,
    float shininess
    ){
      vec3 diffuseTerm = lightIntensity * max(dot(lightDir,surfaceNormal), 0.0);
      vec3 ReflectDir = normalize(-reflect(L,N));  
      vec3 specularTerm lightIntensity * pow(max(dot(ReflectDir,eyeDir),0.0),0.3*shininess);
      return diffuseTerm + specularTerm;
  }
  `
})

export class PhongShading extends BaseEffectShading<PhongShading> {
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

  light: Light<any>
  shininess: number = 1;

}