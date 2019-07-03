import { MVPTransformFunction } from "./mvp-transform";
import { depthPackFunction } from "./depth-pack";
import { ShaderFunction } from "../shader-function";

export const BuildInShaderFuntions = [
  MVPTransformFunction,
  depthPackFunction,
  new ShaderFunction(
    {
    description: 'simple add function',
    source: `
    vec4 composeAddVec4(vec4 sourceA, vec4 sourceB){
      return sourceA + sourceB;
    }
    `,
  })
  
]
