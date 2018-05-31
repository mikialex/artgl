import { GLRenderer } from "./webgl-renderer";

export enum ShaderType {
  vertex,
  fragment
}

export interface GLProgramConfig{
  attributes: AttributeDescriptor[];
  uniforms: UniformDescriptor[];
  vertexShaderString: string;
  fragmentShaderString: string;
  autoInjectHeader:boolean
}

export interface AttributeDescriptor{
  name: string,
  stride: number
}

export interface UniformDescriptor {
  name: string,
  type: string
}

export class GLShader {
  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
  }
  renderer: GLRenderer;
  shader: WebGLShader;

  compileRawShader = (source: string, type: ShaderType): WebGLShader => {
    const gl = this.renderer.gl;
    var shader = gl.createShader(type === ShaderType.vertex ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      let log = gl.getShaderInfoLog(shader);
      if (log) {
        throw new Error(log);
      }
    }
    if (!shader) {
      throw new Error("Something went wrong while compile the shader.");
    }
    this.shader = shader;
    return shader;
  };

}