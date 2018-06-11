import { AttributeUsage } from "../core/attribute";

export function generateStandradProgramConfig() {
  return {
    attributes: [
      { name: 'position', stride: 3 , usage:AttributeUsage.position},
      { name: 'normal', stride: 3, usage: AttributeUsage.normal},
      { name: 'uv', stride: 2, usage: AttributeUsage.uv},
    ],
    uniforms: [
      { name: 'matrix', type: 'uniform1f' }
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