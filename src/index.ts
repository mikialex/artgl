import { GLRenderer, ShaderType, GLProgram } from "./core/webgl-renderer";
import { GLShader } from "./core/webgl-renderer";

window.onload = function(){
  let canv = document.querySelector('canvas');
  let renderer = new GLRenderer(canv);

  var vertexShaderSource =
    "attribute vec4 position;\n" +
    "void main() {\n" +
    "  gl_Position = position;\n" +
    "}\n";
  
  var fragmentShaderSource =
    "attribute vec4 position;\n" +
    "void main() {\n" +
    "  gl_Position = position;\n" +
    "}\n";

  // var vertexShader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER)

  let vertexShader = new GLShader(renderer);
  vertexShader.compileRawShader(vertexShaderSource, ShaderType.vertex);

  let fragShader = new GLShader(renderer);
  vertexShader.compileRawShader(vertexShaderSource, ShaderType.fragment);

  let program = new GLProgram(renderer);
  // program.createProgram()
  console.log(renderer);
}
