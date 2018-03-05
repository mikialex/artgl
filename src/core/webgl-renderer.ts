export class GLRenderer {
  constructor(el: HTMLCanvasElement, options?: any) {
    this.el = el;
    this.gl = el.getContext('webgl', options);
  }
  gl: WebGLRenderingContext
  el: HTMLCanvasElement

  
}


export class WebGLAttributes {
  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
  }
  gl: WebGLRenderingContext

  createBuffer() {

  }
}











export enum ShaderType{
  vertex,
  fragment
}

export class GLShader {
  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
  }
  renderer: GLRenderer
  shader: WebGLShader
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


export class GLProgram {
  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
  }
  renderer: GLRenderer
  program: WebGLProgram

  createProgram(vertexShader: GLShader, fragmentShader: GLShader) {
    const gl = this.renderer.gl;
    this.program = gl.createProgram();
    gl.attachShader(this.program, vertexShader.shader);
    gl.attachShader(this.program, fragmentShader.shader);
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      let info = gl.getProgramInfoLog(this.program);
      throw 'Could not compile WebGL program. \n\n' + info;
    }
  }


}
