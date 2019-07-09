import { ShaderFunction } from "../shader-function";

export const lightness = new ShaderFunction({
  source: `
  float lightness(vec3 color){
    return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
  }`
})