import { GLRenderer } from "./gl-renderer";

export enum ShaderType {
  vertex,
  fragment
}

export class GLShader {
  constructor(renderer: GLRenderer, type: ShaderType) {
    this.renderer = renderer;
    const gl = this.renderer.gl;
    this.type = type;
    var shader = gl.createShader(type === ShaderType.vertex ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
    if (shader === null) {
      throw 'webgl shader create failed';
    }
    this.shader = shader;
  }
  renderer: GLRenderer;
  shader: WebGLShader;
  type: ShaderType;

  compileShader(source: string): WebGLShader {
    const gl = this.renderer.gl;
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);
    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      let log = gl.getShaderInfoLog(this.shader);
      if (log) {
        logDebugShaderSource(source);
        throw new Error(log);
      }
    }
    if (!this.shader) {
      throw "Something went wrong while compile the shader.";
    }
    return this.shader;
  };

  dispose() {
    this.renderer.gl.deleteShader(this.shader);
  }

}

function logDebugShaderSource(source: string) {
  console.warn(addLineNumbers(source));
}

function addLineNumbers(str: string) {
  var lines = str.split('\n');
  for (var i = 0; i < lines.length; i++) {
    lines[i] = (i + 1) + ': ' + lines[i];
  }
  return lines.join('\n');
}