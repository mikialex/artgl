import { GLRenderer, ShaderType, GLProgram, GLAttribute, GLUniform } from "./core/webgl-renderer";
import { GLShader } from "./core/webgl-renderer";
import { Geometry } from "./core/geometry";
import { RenderObject } from "./core/render-object";

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

  let vertexShader = new GLShader(renderer);
  vertexShader.compileRawShader(vertexShaderSource, ShaderType.vertex);

  let fragShader = new GLShader(renderer);
  fragShader.compileRawShader(fragmentShaderSource, ShaderType.fragment);

  let program = new GLProgram(renderer, vertexShader, fragShader);
  console.log(renderer);

  let testGeo = new Geometry();
  let positionAtt = new GLAttribute(renderer, 'position', program);
  positionAtt.setData(testGeo.createTestVertices(), 2);
  let vertexColorAtt = new GLAttribute(renderer, 'vertexColor', program);
  vertexColorAtt.setData(testGeo.createTestVerticesColors(), 3);

  let lineColorUni = new GLUniform(renderer, 'lineColor', program);
  lineColorUni.setData(0.8);

  let testObj = new RenderObject();
  testObj.updateObjToWorldMatrix();
  console.log(testObj);


  renderer.render();
}
