import { ShaderFunction } from "../shader-function";
import { GLDataType } from "../../webgl/shader-util";

export const depthPackFunction = new ShaderFunction({
  name: 'depthPack',
  description: 'pack depth to RGBA output',
  source: `
    vec4 bitSh = vec4(256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0);
    vec4 bitMsk = vec4(0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0);
    vec4 enc = fract(frag_depth * bitSh);
    enc -= enc.xxyz * bitMsk;
    return enc;
  `,
  inputs: [
    {
      name: "frag_depth",
      type: GLDataType.float
    }
  ],
  returnType: GLDataType.floatVec4
})

