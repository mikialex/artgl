import { GLRenderer } from "../gl-renderer";
import { GLShader, ShaderType } from "./shader";
import { generateUUID } from "../../math/uuid";
import { injectVertexShaderHeaders, injectFragmentShaderHeaders } from "../shader-util";
import { GLUniform } from "./uniform/uniform";
import { GLAttribute } from "./attribute";
import { GLTextureUniform } from "./uniform/uniform-texture";
import { GLData } from "../../core/data-type";
import { GLProgramConfig, uniformUploadType } from "../interface";

function fulfillProgramConfig(config: GLProgramConfig) {
  if (config.useIndex === undefined) {
    config.useIndex = true;
  }
  if (config.uniforms === undefined) {
    config.uniforms = [];
  }
  return config;
}


export class GLProgram {
  constructor(renderer: GLRenderer, config: GLProgramConfig) {
    fulfillProgramConfig(config);
    this.renderer = renderer;

    this.vertexShader = new GLShader(this.renderer, ShaderType.vertex);
    this.fragmentShader = new GLShader(this.renderer, ShaderType.fragment);
    this.compileShaders(config, this.renderer.ctxVersion === 2);

    this.createProgram(this.vertexShader, this.fragmentShader);
    this.createGLResource(config);

    this.config = config;
    if (config.useIndex !== undefined) {
      this.useIndexDraw = config.useIndex;
    }
  }

  id: string = generateUUID();

  readonly renderer: GLRenderer;
  private program!: WebGLProgram;
  getProgram(): WebGLProgram { return this.program };

  private config: GLProgramConfig;

  getConfig(): Readonly<GLProgramConfig> {
    return this.config;
  }

  readonly attributes: Map<string, GLAttribute> = new Map();
  readonly uniforms: Map<string, GLUniform>= new Map();
  readonly textures: Map<string, GLTextureUniform>= new Map();

  private vertexShader: GLShader;
  private fragmentShader: GLShader;

  drawFrom: number = 0;
  drawCount: number = 0;

  instanceCount: number = 0;
  useInstance: boolean = false;

  useIndexDraw: boolean = false;
  _indexUINT: boolean = false;
  set indexUINT(value: boolean) {
    if (value && !this._indexUINT && !this.renderer.glInfo.supportUintIndexDraw) {
      throw "Your webgl not support uint index buffer draw"
    }
    this._indexUINT = value
  }
  
  private compileShaders(conf: GLProgramConfig, isWebGL2: boolean) {
    let vertexShaderString = conf.vertexShaderString;
    let fragmentShaderString = conf.fragmentShaderString;
    vertexShaderString = injectVertexShaderHeaders(conf, conf.vertexShaderString, isWebGL2);
    fragmentShaderString = injectFragmentShaderHeaders(conf, conf.fragmentShaderString, isWebGL2);
    
    this.vertexShader.compileShader(vertexShaderString);
    this.fragmentShader.compileShader(fragmentShaderString);
  }

  private createProgram(vertexShader: GLShader, fragmentShader: GLShader) {
    const gl = this.renderer.gl;
    const program = gl.createProgram();
    if (program === null) {
      throw 'Webgl program create failed';
    }
    this.program = program;
    gl.attachShader(this.program, vertexShader.shader);
    gl.attachShader(this.program, fragmentShader.shader);
    gl.linkProgram(this.program);
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      let info = gl.getProgramInfoLog(this.program);
      throw 'Could not compile WebGL program. \n\n' + info;
    }
  }

  private createGLResource(config: GLProgramConfig) {
    const gl = this.renderer.gl;
    const program = this.getProgram();
    config.attributes.forEach(att => {
      const location = gl.getAttribLocation(program, att.name);
      if (location === -1) {
        console.warn(`Attribute <${att.name}> not really used in shader: `, config);
        return;
      }
      this.attributes.set(att.name, new GLAttribute(this, att, location))
    });

    if (config.uniforms !== undefined) {
      config.uniforms.forEach(uni => {
        const location = gl.getUniformLocation(program, uni.name);
        if (location === null) {
          console.warn(`Uniform <${uni.name}> not really used in shader: `, config);
          return;
        }
        this.uniforms.set(uni.name, new GLUniform(this, uni, location));
      });
    }
    if (config.textures !== undefined) {
      config.textures.forEach(tex => {
        const location = gl.getUniformLocation(program, tex.name);
        if (location === null) {
          console.warn(`Texture <${tex.name}> not really used in shader: `, config);
          return;
        }
        this.textures.set(tex.name, new GLTextureUniform(this, tex, location));
      });
    }
  }

  setDrawRange(start: number, count: number) {
    this.drawFrom = start;
    this.drawCount = count;
  }

  setUniform(name: string, data: uniformUploadType) {
    this.uniforms.get(name)!.set(data);
  }

  setUniformIfExist(name: string, data: uniformUploadType) {
    const uni = this.uniforms.get(name);
    if (uni !== undefined) {
      uni.set(data);
    }
  }

  setTextureIfExist(name: string, data: WebGLTexture) {
    const tex = this.textures.get(name);
    if (tex !== undefined) {
      tex.useTexture(data);
    }
  }

  useIndexBuffer(buffer: WebGLBuffer) {
    const gl = this.renderer.gl;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  }

  dispose() {
    this.vertexShader.dispose();
    this.fragmentShader.dispose();
    this.renderer.gl.deleteProgram(this.program);
  }
}
