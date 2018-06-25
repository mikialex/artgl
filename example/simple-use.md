# lowest level usage demo

create a renderer and a program, set attributes, uniforms, draw it.

```ts

var vertexShaderSource =
  `
    varying vec4 color;
    attribute vec4 position;
    attribute vec4 vertexColor;
    void main() {
      gl_Position = position;
      color = vertexColor;
    }
    ` ;

var fragmentShaderSource =
  `
    precision mediump float;
    uniform float lineColor;
    varying vec4 color;
    float blue = lineColor * 0.2;
    void main() {
      gl_FragColor = color * lineColor;
    }
    `

let canv = document.querySelector('canvas');
let renderer = new GLRenderer(canv);


let program = new GLProgram(renderer,
  {
    attributes: [
      { name: 'position', type: GLDataType.floatVec3 },
      { name: 'vertexColor', type: GLDataType.floatVec3 }
    ],
    uniforms: [
      { name: 'lineColor', type: GLDataType.float }
    ],
    vertexShaderString: vertexShaderSource,
    fragmentShaderString: fragmentShaderSource,
    autoInjectHeader: false,
  }
);


program.setAttribute('position', new Float32Array([1,1,1,2,3,4]));
program.setAttribute('vertexColor', new Float32Array([1, 1, 1, 2, 3, 4]));

program.setUniform('lineColor', 0.8);

renderer.useProgram(program);
renderer.render();

```