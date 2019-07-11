import { ShaderFunction } from "../shader-function";

export const rand = new ShaderFunction({
  source: `float rand(float n) {return fract(sin(n) * 43758.5453123);}`
})

export const randDir3D = new ShaderFunction({
  source: `
  vec3 randDir(float randA, float randB){
    float lambda = acos(2.0 * randA - 1.0) - PI / 2.0;
    float phi = 2.0 * PI * randB;
    return vec3(
      cos(lambda) * cos(phi),
      cos(lambda) * sin(phi),
      sin(lambda)
    );
  }
  `
})