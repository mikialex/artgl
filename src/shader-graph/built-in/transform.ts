import { ShaderFunction } from "../shader-function";

export const DivW = new ShaderFunction({
  source: `
    vec3 DivW ( vec4 position){
      return position.xyz / position.w;
    }
  `
})

export const MTransform = new ShaderFunction({
  source: `
    vec4 MTransform (mat4 MMatrix, vec3 position){
      return MMatrix * vec4(position, 1.0);
    }
  `
})

export const VPTransform = new ShaderFunction({
  source: `
    vec4 VPTransform (mat4 VPMatrix, vec4 position){
      return VPMatrix * position;
    }
  `
})

export const getWorldPosition = new ShaderFunction({
  description:
    `Transform from the current view projection matrix and its inverse, 
     and uv coordinates to world position`,
  source:
    `
    vec4 getWorldPosition(
      vec2 uv, 
      float depth, 
      mat4 VPMatrix, 
      mat4 VPMatrixInverse
    ){
      float clipW = VPMatrix[2][3] * depth + VPMatrix[3][3];
      vec4 position = VPMatrixInverse * (vec4(uv * 2.0 - 1.0, depth, 1.0) * clipW);
      return position / position.w;
    }
    `
})

export const NDCxyToUV = new ShaderFunction({
  description:
    `Get texture uv lookup position from NDC`,
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

export const dir3D = new ShaderFunction({
  source: `
  vec3 randDir(float x, float y){
    float PI =  3.14159265; // TODO
    float lambda = acos(2.0 * x - 1.0) - PI / 2.0;
    float phi = 2.0 * PI * y;
    return vec3(
      cos(lambda) * cos(phi),
      cos(lambda) * sin(phi),
      sin(lambda)
    );
  }
  `
})