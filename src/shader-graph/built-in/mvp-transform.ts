import { ShaderFunction } from "../shader-function";
import { GLDataType } from "../../webgl/shader-util";

export const MVPTransformFunction = new ShaderFunction({
  name: 'depthPack',
  description: 'pack depth to RGBA output',
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

