// import { Technique } from "../core/technique";
// import { ShaderFunction } from "./shader-function";
// import { GLDataType } from "../webgl/shader-util";

// /*
// * convert a shader function that can compose other shader function
// */
// export function createEffectComposer(shaderfunction: ShaderFunction)
//   : any {
  
//   return (a: ShaderFunction, b: ShaderFunction) => {
    
//     return new ShaderFunction();
//   }
// }

// export function createUniformInput() {
  
// }

// const gamma = new ShaderFunction({
//   source: `
//     vec4 gammaCorrection(vec4 input){
//       vec4 gammaed = sqrt(input.rgb);
//       return vec4(gammaed, input.a)
//     };
//   `,
// })

// const add = new ShaderFunction({
//   source: `
//     vec4 add(vec4 input1, vec4 input2){
//       return input1 + input2;
//     }
//   `,
// })

// const effect = createUniformInput("baseColor", GLDataType.floatVec3);

// const gammaCorrection = createEffectComposer(gamma);
// const composeAdd = createEffectComposer(add);

// const technique = gammaCorrection(composeAdd(effect, light));