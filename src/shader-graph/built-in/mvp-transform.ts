import { ShaderFunction } from "../shader-function";

export const MVPTransformFunction = new ShaderFunction({
  description: 'using cameraprojection and mm matrix to transform vertices',
  source: `
    vec4 VPtransform (mat4 VPMatrix, mat MMatrix, vec3 position){
      return VPMatrix * MMatrix * vec4(position, 1.0);
    }
  `,
})

