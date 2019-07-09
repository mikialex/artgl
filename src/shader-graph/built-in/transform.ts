import { ShaderFunction } from "../shader-function";

export const MVPTransform = new ShaderFunction({
  description: 'using camera projection and mm matrix to transform vertices',
  source: `
    vec4 VPtransform (mat4 VPMatrix, mat4 MMatrix, vec3 position){
      return VPMatrix * MMatrix * vec4(position, 1.0);
    }
  `,
})

export const getLastWorldPosition = new ShaderFunction({
  source:
    `
    vec4 getWorldPosition(
      vec2 cood, 
      float depth, 
      mat4 VPMatrix, 
      mat4 LastVPMatrixInverse){
      float clipW = VPMatrix[2][3] * depth + VPMatrix[3][3];
      return VPMatrixInverse * (vec4(cood * 2.0 - 1.0, depth, 1.0) * clipW);
    }
    `
})

export const NDCxyToUV = new ShaderFunction({
  source: `
  vec2 NDCTextureLookUp(vec3 ndc){
    return vec2(ndc.x / 2.0 + 0.5, ndc.y / 2.0 + 0.5);
  }`
})