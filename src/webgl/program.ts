import { GLRenderer } from "./webgl-renderer";
import { GLShader, ShaderType } from "./shader";
import { generateUUID } from "../math/uuid";
import { injectVertexShaderHeaders, injectFragmentShaderHeaders, GLDataType, GLData } from "./shader-util";
import { GLUniform, UniformDescriptor } from "./uniform/uniform";
import { AttributeDescriptor, GLAttribute, AttributeUsage } from "./attribute";
import { Nullable } from "../type";
import { GLTexture, TextureDescriptor } from "./gl-texture";

export interface VaryingDescriptor {
  name: string,
  type: GLDataType
}

export interface GLProgramConfig {
  attributes: AttributeDescriptor[];
  uniforms?: UniformDescriptor<any>[];
  varyings?: VaryingDescriptor[];
  textures?: TextureDescriptor[];
  vertexShaderString: string;
  fragmentShaderString: string;
  autoInjectHeader: boolean
}


export class GLProgram {
  constructor(renderer: GLRenderer, config: GLProgramConfig) {
    this.renderer = renderer;
    this.id = generateUUID();

    this.vertexShader = new GLShader(this.renderer, ShaderType.vertex);
    this.fragmentShader = new GLShader(this.renderer, ShaderType.fragment);
    this.compileShaders(config);

    this.createProgram(this.vertexShader, this.fragmentShader);
    this.createGLResource(config);
    
    this.config = config;
    renderer.programManager.addNewProgram(this);

    config.attributes.forEach(att => {
      if (att.usage !== undefined) {
        this.attributeUsageMap[att.usage] = this.attributes[att.name];
      }
    });
  }
  id: string;
  readonly renderer: GLRenderer;
  getRenderer() { return this.renderer };
  private program: Nullable<WebGLProgram> = null;
  getProgram(): WebGLProgram {
    if (this.program === null) {
      throw 'program is broken'
    }
    return this.program
  };
  private config: GLProgramConfig;
  private attributes: { [index: string]: GLAttribute } = {};
  private attributeUsageMap: { [index: number]: GLAttribute } = {};
  private uniforms: { [index: string]: GLUniform<any> } = {};
  private textures: { [index: string]: GLTexture };
  private vertexShader: GLShader;
  private fragmentShader: GLShader;
  drawFrom: number = 0;
  drawCount: number = 0;
  useIndexDraw: boolean = false;

  private compileShaders(conf: GLProgramConfig) {
    if (conf.autoInjectHeader) {
      conf.vertexShaderString = injectVertexShaderHeaders(conf, conf.vertexShaderString);
      conf.fragmentShaderString = injectFragmentShaderHeaders(conf, conf.fragmentShaderString);
      console.log(conf.vertexShaderString);
      console.log(conf.fragmentShaderString);
    }
    this.vertexShader.compileShader(conf.vertexShaderString, ShaderType.vertex);
    this.fragmentShader.compileShader(conf.fragmentShaderString, ShaderType.fragment);
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
        this.textures[tex.name] = new GLTexture(this, tex);
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

  getAttributeByUsage(usage:AttributeUsage) {
    return this.attributeUsageMap[usage];
  }

  setDrawRange(start:number, count:number) {
    this.drawFrom = start;
    this.drawCount = count;
  }

  setUniform(name: string, data: GLData) {
    this.uniforms[name].set(data);
  }

  useIndexBuffer(buffer: WebGLBuffer) {
    const gl = this.renderer.gl;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  }

  dispose() {
    
  }
}
