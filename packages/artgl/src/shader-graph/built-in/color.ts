import { ShaderFunction } from "../shader-function";

export const lightness = new ShaderFunction({
  source: `
  float lightness(vec3 color){
    return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
  }`
})

export const clampColor = new ShaderFunction({
  source: 
    `
    vec3 getClampColor(vec2 cood, vec3 colorToClamp){
      vec3 right = texture2D(sceneResult, cood + vec2(screenPixelXStep, 0.)).rgb;
      vec3 left = texture2D(sceneResult, cood + vec2(-screenPixelXStep, 0.)).rgb;
      vec3 top = texture2D(sceneResult, cood + vec2(0., screenPixelYStep)).rgb;
      vec3 bottom = texture2D(sceneResult, cood + vec2(0., -screenPixelYStep)).rgb;
      vec3 max = max(max(max(left, right), top), bottom);
      vec3 min = min(min(min(left, right), top), bottom);
      return clamp(colorToClamp, min, max);
    }
    `
})