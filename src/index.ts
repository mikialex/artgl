import { GLRenderer, GLProgram } from "./core/webgl-renderer";
import { Geometry } from "./core/geometry";
import { RenderObject } from "./core/render-object";
import { SphereGeometry } from "./geometry/sphere-geometry";
import { ShaderType, GLShader } from "./core/shader";

window.onload = function(){

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
    float blue = lineColor * 0.5;
    void main() {
      gl_FragColor = color * lineColor;
    }
    `  

  let canv = document.querySelector('canvas');
  let renderer = new GLRenderer(canv);
  console.log(renderer);

  let vertexShader = new GLShader(renderer);
  vertexShader.compileRawShader(vertexShaderSource, ShaderType.vertex);
  let fragShader = new GLShader(renderer);
  fragShader.compileRawShader(fragmentShaderSource, ShaderType.fragment );


  let program = new GLProgram(renderer, vertexShader, fragShader,
    {
      attributes: [
        { name: 'position', stride: 2 },
        { name:'vertexColor', stride: 3}
      ],
      uniforms: [
        { name: 'lineColor', type: 'uniform1f' }
      ]
    }
  );



  let testGeo = new Geometry();

  program.setAttribute('position', testGeo.createTestVertices());
  program.setAttribute('vertexColor', testGeo.createTestVerticesColors());

  program.setUniform('lineColor', 0.8);

  renderer.render();
  // renderer.clear();

}
  