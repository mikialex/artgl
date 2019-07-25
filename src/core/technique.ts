import { UniformProxy } from "../engine/uniform-proxy";
import { Light } from "./light";
import { Shading } from "./shading";

export type UniformGroup = Map<string, UniformProxy>

export class Technique {
  shading: Shading
  uniforms: UniformGroup = new Map();
  decoratedUniforms: Map<string, UniformGroup[]> = new Map();
  constructor(shading: Shading) {
    this.shading = shading;
    this.shading.getProgramConfig(); 
    const inputs = this.shading.baseProgramInputsCache;
    this.uniforms = new Map();
    if (inputs.uniforms !== undefined) {
      inputs.uniforms.forEach(uni => {
        this.uniforms.set(uni.name, new UniformProxy(uni.default));
      })
    }
  }

  apply(light: Light): Technique {
    const name = light.decorator.name;
    const uni = this.decoratedUniforms.get(name);
    // TODO
    // if (uni === undefined) {
    //   throw "this technique is not decorated by Light: <name>, decorate before use it"
    // }
    // if (uni.length > 0) {
    //   throw 'light list is not support yet'
    // }
    // uni.push(light.uniforms)
    return this;
  }


}
