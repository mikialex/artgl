import { GLRenderer } from "./gl-renderer";
import { GLShader, ShaderType } from "./shader";
import { generateUUID } from "../math/uuid";
import { injectVertexShaderHeaders, injectFragmentShaderHeaders, GLDataType, GLData } from "./shader-util";
import { GLUniform, UniformDescriptor, getInnerUniformDescriptor, InnerUniformMapDescriptor, InnerSupportUniform } from "./uniform/uniform";
import { AttributeDescriptor, GLAttribute } from "./attribute";
import { Nullable } from "../type";
import { GLTextureUniform, TextureDescriptor } from "./uniform/uniform-texture";
import { RenderEngine } from "../engine/render-engine";

export interface VaryingDescriptor {
  name: string,
  type: GLDataType
}

export interface GLProgramConfig {
  attributes: AttributeDescriptor[];
  uniforms?: UniformDescriptor[];
  uniformsIncludes?: InnerUniformMapDescriptor[];
  _hasUniformIncludesExpand?: boolean;
  varyings?: VaryingDescriptor[];
  textures?: TextureDescriptor[];
  vertexShaderString: string;
  fragmentShaderString: string;
  autoInjectHeader: boolean;
  useIndex?: boolean;
}

function fulfillProgramConfig(config: GLProgramConfig){
  if (config.useIndex === undefined) {
    config.useIndex = true;
  }
  if (config.uniforms === undefined) {
    config.uniforms = [];
  }
  if (config.uniformsIncludes !== undefined && config._hasUniformIncludesExpand !== true) {
    config.uniformsIncludes.forEach(ui => {
      (config.uniforms as UniformDescriptor[]).push(getInnerUniformDescriptor(ui));
    })
    config._hasUniformIncludesExpand = true;
  }
  return config;
}


export class GLProgram{
  constructor(renderer: GLRenderer, config: GLProgramConfig) {
    fulfillProgramConfig(config);
    this.renderer = renderer;

    this.vertexShader = new GLShader(this.renderer, ShaderType.vertex);
    this.fragmentShader = new GLShader(this.renderer, ShaderType.fragment);
    this.compileShaders(config);

    this.createProgram(this.vertexShader, this.fragmentShader);
    this.createGLResource(config);
    
    if (config.uniformsIncludes !== undefined) {
      config.uniformsIncludes.forEach(des => {
        this.globalUniforms.push(this.uniforms[des.name])
      })
    }

    this.config = config;
    if (config.useIndex !== undefined) {
      this.useIndexDraw = config.useIndex;
    }
    renderer.programManager.addNewProgram(this);

  }
  
  id: string = generateUUID();

  readonly renderer: GLRenderer;
  private program: Nullable<WebGLProgram> = null;
  getProgram(): WebGLProgram {
    if (this.program === null) {
      throw 'program is broken'
    }
    return this.program
  };

  private config: GLProgramConfig;
  
  getConfig(): Readonly<GLProgramConfig> {
    return this.config;
  }

  private attributes: { [index: string]: GLAttribute } = {};
  private uniforms: { [index: string]: GLUniform } = {};
  private globalUniforms: GLUniform[] = [];
  private textures: { [index: string]: GLTextureUniform } = {};

  private vertexShader: GLShader;
  private fragmentShader: GLShader;

  framebufferTextureMap: { [index: string]: string } = {};

  drawFrom: number = 0;
  drawCount: number = 0;

  instanceCount: number = 0;
  useInstance: boolean = false;

  useIndexDraw: boolean = false;
  _indexUINT: boolean = false;
  set indexUINT(value: boolean) {
    if (value && !this._indexUINT && !this.renderer.glInfo.supportUintIndexDraw) {
      throw "your webgl not support uint draw"
    }
    this._indexUINT = value
  }


  public defineFrameBufferTextureDep(framebufferName: string, uniformName: string) {
    this.framebufferTextureMap[uniformName] = framebufferName;
  }

  public forUniforms(cb: (uniform: GLUniform) => any): void {
    for (const key in this.textures) {
      cb(this.uniforms[key]);
    }
  }

  public forTextures(cb: (texture: GLTextureUniform) => any): void {
    for (const key in this.textures) {
      cb(this.textures[key]);
    }
  }

  public forAttributes(cb: (texture: GLAttribute) => any): void {
    for (const key in this.attributes) {
      cb(this.attributes[key]);
    }
  }

  private compileShaders(conf: GLProgramConfig) {
    let vertexShaderString = conf.vertexShaderString;
    let fragmentShaderString = conf.fragmentShaderString;
    if (conf.autoInjectHeader) {
      vertexShaderString = injectVertexShaderHeaders(conf, conf.vertexShaderString);
      fragmentShaderString = injectFragmentShaderHeaders(conf, conf.fragmentShaderString);
    }
    this.vertexShader.compileShader(vertexShaderString);
    this.fragmentShader.compileShader(fragmentShaderString);
  }

  private createProgram(vertexShader: GLShader, fragmentShader: GLShader) {
    const gl = this.renderer.gl;
    const program = gl.createProgram();
    if (program === null) {
      throw 'webgl program create failed';
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
    if (config.attributes !== undefined) {
      config.attributes.forEach(att => {
        this.attributes[att.name] = new GLAttribute(this, att)
      })
    }
    if (config.uniforms !== undefined) {
      config.uniforms.forEach(uni => {
        this.uniforms[uni.name] = new GLUniform(this, uni)
      })
    }
    if (config.textures !== undefined) {
      config.textures.forEach(tex => {
        this.textures[tex.name] = new GLTextureUniform(this, tex);
      })
    }
  }

  updateAttribute(name: string, data: WebGLBuffer) {
    const attribute = this.attributes[name];
    if (attribute === undefined) {
      throw 'try to set a none exist attribute';
    }
    attribute.useBuffer(data);
  }

  setTexture(name: string, webglTexture: WebGLTexture) {
    this.textures[name].useTexture(webglTexture);
  }

  setDrawRange(start:number, count:number) {
    this.drawFrom = start;
    this.drawCount = count;
  }

  setUniform(name: string, data: GLData) {
    this.uniforms[name].set(data);
  }

  setUniformIfExist(name: string, data: GLData) {
    const uni = this.uniforms[name];
    if (uni !== undefined) {
      this.uniforms[name].set(data);
    }
  }

  updateInnerGlobalUniforms(engine: RenderEngine) {
    this.globalUniforms.forEach(uni => {
      uni.set(engine.getGlobalUniform(uni.innerGlobal as InnerSupportUniform).value)
    })
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
