import { GLRenderer } from "./gl-renderer";
import { GLProgramConfig } from "./program";

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