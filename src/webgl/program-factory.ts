function generateStandradProgramConfig() {
  return {
    attributes: [
      { name: 'position', stride: 3 },
      { name: 'normal', stride: 3 },
      { name: 'uv', stride: 2 },
    ],
    uniforms: [
      { name: 'matrix', type: 'uniform1f' }
    ],
    varyings: [
      { name: 'color', type: 'vec4' }
    ],
    usageMap: {
      position: 'position',
      normal: 'normal'
    },
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