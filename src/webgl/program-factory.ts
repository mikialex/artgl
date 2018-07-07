import { AttributeUsage } from "../core/attribute";
import { GLDataType } from "./shader-util";

export function generateStandradProgramConfig() {
  return {
    attributes: [
      { name: 'position', stride: 3, usage: AttributeUsage.position, type: GLDataType.floatVec4 },
      { name: 'normal', stride: 3, usage: AttributeUsage.normal, type: GLDataType.floatVec3},
      { name: 'uv', stride: 2, usage: AttributeUsage.uv, type: GLDataType.floatVec2},
    ],
    uniforms: [
      { name: 'matrix', type: GLDataType.float }
    ],
    varyings: [],
    vertexShaderString:
      `
          void main() {
            gl_Position = position;
          }
        `,
    fragmentShaderString:
      `
          void main() {
            gl_FragColor = vec4(0.5,0.5,0.5,1);
          }
        `
    ,
    autoInjectHeader: true,
  }
}