import { MVPTransformFunction } from "./mvp-transform";
import { depthPackFunction } from "./depth-pack";
import { ShaderFunction } from "../shader-function";
import { GLDataType } from "../../webgl/shader-util";

export const BuildInShaderFuntions = [
  MVPTransformFunction,
  depthPackFunction,
  new ShaderFunction({
    name: 'composeAddVec4',
    description: 'simple add function',
    source: `
      return sourceA + sourceB;
    `,
    inputs: [
      {
        name: "sourceA",
        type: GLDataType.floatVec4
      },
      {
        name: "sourceB",
        type: GLDataType.floatVec4
      }
    ],
    returnType: GLDataType.floatVec4
  })
  
]
