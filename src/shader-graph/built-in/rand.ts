import { ShaderFunction } from "../shader-function";

export const rand = new ShaderFunction({
  source: `float rand(float n) {return fract(sin(n) * 43758.5453123);}`
})

export const rand2D = new ShaderFunction({
  source: `
  float rand(vec2 cood){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
  `
})

export const rand2DT = new ShaderFunction({
  source: `
  float rand(vec2 cood, float t){
    vec2 co = cood;
    co.x = sin(t) + co.x;
    co.y = cos(t) + co.y;
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
  `
})
