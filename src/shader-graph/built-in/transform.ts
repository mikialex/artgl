import { ShaderFunction } from "../shader-function";

export const MVPTransform = new ShaderFunction({
  description: 'using camera projection and mm matrix to transform vertices',
  source: `
    vec4 VPtransform (mat4 VPMatrix, mat4 MMatrix, vec3 position){
      return VPMatrix * MMatrix * vec4(position, 1.0);
    }
  `,
})

export const getWorldPosition = new ShaderFunction({
  description: 'from the vpmatrix and its inverse, from uv to world position',
  source:
    `
    vec4 getWorldPosition(
      vec2 uv, 
      float depth, 
      mat4 VPMatrix, 
      mat4 VPMatrixInverse){
      float clipW = VPMatrix[2][3] * depth + VPMatrix[3][3];
      return VPMatrixInverse * (vec4(uv * 2.0 - 1.0, depth, 1.0) * clipW);
    }
    `
})

export const NDCxyToUV = new ShaderFunction({
  source: `
  vec2 NDCTextureLookUp(vec3 ndc){
    return vec2(ndc.x / 2.0 + 0.5, ndc.y / 2.0 + 0.5);
  }`
})

export const UVDepthToNDC = new ShaderFunction({
  source: `
  vec4 UVDepthToNDC(float depth, vec2 uv){
    return vec4(uv.x * 2.0 - 1.0, uv.y * 2.0 - 1.0,depth, 1.0);
  }`
})


export const getLastPixelNDC = new ShaderFunction({
  source: `
  vec3 getLastPixelNDC(vec4 ndc, mat4 VPMatrixInverse, mat4 LastVPMatrix){

    // we consider frag too far is background
    if(ndc.z > 0.99){
      return ndc.xyz;
    }
    
    vec4 worldPosition = VPMatrixInverse * ndc;
    vec4 oldPosition = LastVPMatrix * worldPosition;
    oldPosition = oldPosition / oldPosition.w;
    return  oldPosition.xyz;
  }
  `
})