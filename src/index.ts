import { GLRenderer, ShaderType } from "./core/webgl-renderer";
import { GLShader } from "./core/webgl-renderer";

window.onload = function(){
  let canv = document.querySelector('canvas');
  let renderer = new GLRenderer(canv);

  var vertexShaderSource =
    "attribute vec4 position;\n" +
    "void main() {\n" +
    "  gl_Position = position;\n" +
    "}\n";

  // var vertexShader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER)

  let vertexShader = new GLShader(renderer);
  vertexShader.compileRawShader(vertexShaderSource, ShaderType.vertex);
  console.log(renderer);
}