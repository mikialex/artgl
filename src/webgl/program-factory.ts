import { AttributeUsage } from "../core/attribute";

function generateStandradProgramConfig() {
  return {
    attributes: [
      { name: 'position', stride: 3 , usage:AttributeUsage.position},
      { name: 'normal', stride: 3, usage: AttributeUsage.normal},
      { name: 'uv', stride: 2, usage: AttributeUsage.uv},
    ],
    uniforms: [
      { name: 'matrix', type: 'uniform1f' }
    ],
    varyings: [
      { name: 'color', type: 'vec4' }
    ],
    vertexShaderString:
      `
          void main() {
            gl_Position = position;
            color = vec4(0.5,0.5,0.5,1);
          }
        `,
    fragmentShaderString:
      `
          float blue = lineColor * 0.2;
          void main() {
            gl_FragColor = color * lineColor;
          }
        `
    ,
    autoInjectHeader: true,
  }
}