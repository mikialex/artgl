import { GLRenderer, ShaderType, GLProgram, GLAttribute, GLUniform } from "./core/webgl-renderer";
import { GLShader } from "./core/webgl-renderer";
import { Geometry } from "./core/geometry";
import { RenderObject } from "./core/render-object";

window.onload = function(){

  var vertexShaderSource =
    "attribute vec4 position;\n" +
    "void main() {\n" +
    "  gl_Position = position;\n" +
    "}\n";
  
  var fragmentShaderSource =
    `
    precision mediump float;
    uniform float lineColor;
    float blue = lineColor * 0.5;
    void main() {
      gl_FragColor = vec4(0,0,lineColor,1);
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

  let positionAtt = new GLAttribute(renderer, 'position', program);
  let testGeo = new Geometry();
  positionAtt.setData(testGeo.createTestVertices());

  let lineColorUni = new GLUniform(renderer, 'lineColor', program);
  lineColorUni.setData(0.8);

  let testObj = new RenderObject();
  testObj.updateObjToWorldMatrix();
  console.log(testObj);


  renderer.render();
}
