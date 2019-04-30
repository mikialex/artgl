import { Technique } from "../core/technique";
import { ShaderFunction } from "./shader-function";
import { GLDataType } from "../webgl/shader-util";

export function createEffectComposer(shaderfunction: ShaderFunction)
  : (params: any) => Technique {
  
  return (params) => {
    return new Technique();
  }
}

const gamma = new ShaderFunction({
  name: 'gammaCorrection',
  source: `
    vec4 gammaed = sqrt(input.rgb);
    return vec4(gammaed, input.a);
  `,
  inputs: [
    {
      name: "input",
      type: GLDataType.floatVec4
    }
  ],
  returnType: GLDataType.floatVec4
})

const add = new ShaderFunction({
  name: 'add',
  source: `
    return input1 + input2;
  `,
  inputs: [
    {name: "input1",type: GLDataType.floatVec4},
    {name: "input2",type: GLDataType.floatVec4},
  ],
  returnType: GLDataType.floatVec4
})


const gammaCorrection = createEffectComposer(gamma);
const composeAdd = createEffectComposer(add);
const technique = gammaCorrection(composeAdd(effect, light));