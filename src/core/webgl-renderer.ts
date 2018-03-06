export class GLRenderer {
  constructor(el: HTMLCanvasElement, options?: any) {
    this.gl = el.getContext('webgl', options);
  }
  gl: WebGLRenderingContext

  program: GLProgram
  attributes: Array<GLAttribute> = [];

  render() {
    this.gl.drawArrays(this.gl.LINE_LOOP, 0, 3);
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
  constructor(renderer: GLRenderer, vertexShader: GLShader, fragmentShader: GLShader) {
    this.renderer = renderer;
    renderer.program = this;
    this.createProgram(vertexShader,fragmentShader);
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
    } else {
      gl.useProgram(this.program);
    }
  }
}



export class GLBuffer{
  constructor() {
    
  }
}



export class GLAttribute {
  constructor(renderer: GLRenderer, name:string, program:GLProgram) {
    this.renderer = renderer;
    renderer.attributes.push(this);
    this.name = name;
    this.getAttributeLocation(name, program);
  }
  renderer: GLRenderer;
  buffer: WebGLBuffer;
  name: string;
  position: number;
  
  getAttributeLocation(name: string, program: GLProgram) {
    this.position = this.renderer.gl.getAttribLocation(program.program, name);
  }

  setData(data: any) {
    const gl = this.renderer.gl;
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.position);
  }
}