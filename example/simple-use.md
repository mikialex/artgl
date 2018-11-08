# lowest level usage demo

create a renderer and a program, set attributes, uniforms, draw it.

Create a program by simple config object, which contains two shaders and several attribute and uniform discriptor. Then, bind some data and parameter to it. Finally, create a renderer to render it.

lowest level of artgl useage, just simple encapsule of webglctx.

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

const buffer1 = renderer.createBuffer(new Float32Array([1,1,1,2,3,4].buffer));
const buffer2 = renderer.createBuffer(new Float32Array([1,1,1,2,3,4].buffer));

program.updateAttribute('position', buffer1);
program.updateAttribute('vertexColor', buffer2);

program.setUniform('lineColor', 0.8);

renderer.useProgram(program);
renderer.render();

```