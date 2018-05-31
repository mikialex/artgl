import { GLShader, ShaderConfig } from "./shader";

export class GLRenderer {
  constructor(el: HTMLCanvasElement, options?: any) {
    this.gl = el.getContext('webgl', options);
  }
  gl: WebGLRenderingContext

  program: GLProgram

  render() {
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
  }

  clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }
  
}




export class GLProgram {
  constructor(renderer: GLRenderer, vertexShader: GLShader, fragmentShader: GLShader, config: ShaderConfig) {
    this.renderer = renderer;
    renderer.program = this;
    this.createProgram(vertexShader, fragmentShader);
    this.populateDataSlot(config);
    this.config = config;
  }
  renderer: GLRenderer
  program: WebGLProgram
  config: ShaderConfig

  private createProgram(vertexShader: GLShader, fragmentShader: GLShader) {
    const gl = this.renderer.gl;
    this.program = gl.createProgram();
    gl.attachShader(this.program, vertexShader.shader);
    gl.attachShader(this.program, fragmentShader.shader);
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      let info = gl.getProgramInfoLog(this.program);
      throw 'Could not compile WebGL program. \n\n' + info;
    } else {
      gl.useProgram(this.program);
    }
  }

  private populateDataSlot(config: ShaderConfig) {
    const gl = this.renderer.gl;
    config.attributes.forEach(att => {
      this.attributes[att.name] = {
        name: att.name,
        data: null,
        position: gl.getAttribLocation(this.program, att.name),
        discriptor: att
      }
    })
    config.uniforms.forEach(uni => {
      this.uniforms[uni.name] = {
        name: uni.name,
        data: null,
        position: gl.getUniformLocation(this.program, uni.name),
        discriptor: uni
      }
    })
  }

  private attributes = {};
  private uniforms = {};

  setAttribute(name: string, data: any) {
    const conf = this.attributes[name];
    if (!conf) {
      throw 'try to set a none exist attribute';
    }
    const gl = this.renderer.gl;
    const buffer = gl.createBuffer();
    const position = conf.position;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.vertexAttribPointer(position, conf.discriptor.stride, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(position);
  }

  setUniform(name: string, data: any) {
    const conf = this.uniforms[name];
    if (!conf) {
      throw 'try to set a none exist unifrom';
    }
    const gl = this.renderer.gl;
    const position = conf.position;
    gl.uniform1f(position, data);
  }
}
