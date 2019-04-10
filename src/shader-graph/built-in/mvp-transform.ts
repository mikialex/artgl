import { ShaderFunction } from "../shader-function";
import { GLDataType } from "../../webgl/shader-util";

export const MVPTransformFunction = new ShaderFunction({
  name: 'mvptransfrom',
  description: 'using cameraprojection and mm matrix to transform vertices',
  source: `
    return VPMatrix * MMatrix * vec4(position, 1.0);
  `,
  inputs: [
    {
      name: "VPMatrix",
      type: GLDataType.Mat4
    },
    {
      name: "MMatrix",
      type: GLDataType.Mat4
    },
    {
      name: "position",
      type: GLDataType.floatVec3
    },
  ],
  returnType: GLDataType.floatVec4
})

