import { ShaderFunction } from "../shader-function";

export const controlExposureShading = new ShaderFunction({
  source:
    `vec3 LinearToneMapping(vec3 intensity, float toneMappingExposure){
      return toneMappingExposure * intensity;
    }`
})

export const OptimizedCineonToneMapping = new ShaderFunction({
  source:
    `
    // source: http://filmicgames.com/archives/75
    vec3 OptimizedCineonToneMapping(vec3 intensity, float toneMappingExposure) {
    
      // optimized filmic operator by Jim Hejl and Richard Burgess-Dawson
      intensity *= toneMappingExposure;
      intensity = max( vec3( 0.0 ), intensity - 0.004 );
      return pow( ( intensity * ( 6.2 * intensity + 0.5 ) ) / ( intensity * ( 6.2 * intensity + 1.7 ) + 0.06 ), vec3( 2.2 ) );
    }
    `
})


export const ReinhardToneMapping = new ShaderFunction({
  source:
    `
    // source: https://www.cs.utah.edu/~reinhard/cdrom/
    vec3 ReinhardToneMapping(vec3 intensity, float toneMappingExposure) {
      intensity *= toneMappingExposure;
      return intensity/(vec3(1.0) + intensity);
    }
    `
})

export const Uncharted2Helper = new ShaderFunction({
  source:
    `
    vec3 Uncharted2Helper(vec3 x){
      return max(((x * (0.15 * x + 0.10 * 0.50 ) + 0.20 * 0.02) / (x * (0.15 * x + 0.50) + 0.20 * 0.30)) - 0.02/0.30, vec3(0.0));
    }
    `
})

export const Uncharted2ToneMapping = new ShaderFunction({
  source:
    `
    vec3 Uncharted2ToneMapping(
      vec3 intensity, 
      float toneMappingExposure,
      float toneMappingWhitePoint
      ) {
        intensity *= toneMappingExposure;
        return Uncharted2Helper(intensity) / Uncharted2Helper(vec3(toneMappingWhitePoint));
    }
    `,
  description: `John Hable's filmic operator from Uncharted 2 video game`,
  dependFunction: [Uncharted2Helper]
})

export const ACESFilmicToneMapping = new ShaderFunction({
  source:
    `
    // source: https://knarkowicz.wordpress.com/2016/01/06/aces-filmic-tone-mapping-curve/
    vec3 ACESFilmicToneMapping(vec3 intensity, float toneMappingExposure) {
    
      intensity *= toneMappingExposure;
      return saturate( ( intensity * ( 2.51 * intensity + 0.03 ) ) / ( intensity * ( 2.43 * intensity + 0.59 ) + 0.14 ) );
    
    }
    `
})
