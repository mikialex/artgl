import { ShaderFunction } from "../shader-function";

export const MVPTransformFunction = new ShaderFunction({
  description: 'using camera projection and mm matrix to transform vertices',
  source: `
    vec4 VPtransform (mat4 VPMatrix, mat4 MMatrix, vec3 position){
      return VPMatrix * MMatrix * vec4(position, 1.0);
    }
  `,
})

