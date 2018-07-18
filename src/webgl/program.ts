import { GLRenderer } from "../renderer/webgl-renderer";
import { GLShader, ShaderType } from "./shader";
import { generateUUID } from "../math";
import { injectVertexShaderHeaders, injectFragmentShaderHeaders, GLDataType, GLData } from "./shader-util";
import { GLUniform, UniformDescriptor } from "./uniform/uniform";
import { AttributeDescriptor, GLAttribute, AttributeUsage } from "./attribute";
;

export interface VaryingDescriptor {
  name: string,
  type: GLDataType
}

export interface GLProgramConfig {
  attributes: AttributeDescriptor[];
  uniforms?: UniformDescriptor<any>[];
  varyings?: VaryingDescriptor[];
  vertexShaderString: string;
  fragmentShaderString: string;
  autoInjectHeader: boolean
}


export class GLProgram {
  constructor(renderer: GLRenderer, config: GLProgramConfig) {
    this.renderer = renderer;
    this.id = generateUUID();

    this.createShaders(config);
    this.createProgram(this.vertexShader, this.fragmentShader);
    this.createGLResource(config);
    
    this.config = config;
    renderer.addProgram(this);

    config.attributes.forEach(att => {
      if (att.usage !== undefined) {
        this.attributeUsageMap[att.usage] = this.attributes[att.name];
      }
    });
  }
  id: number;
  private renderer: GLRenderer;
  getRenderer() { return this.renderer };
  private program: WebGLProgram;
  private config: GLProgramConfig;
  private attributes: { [index: string]: GLAttribute } = {};
  private attributeUsageMap: { [index: number]: GLAttribute } = {};
  private uniforms: { [index: string]: GLUniform<any> } = {};
  private vertexShader: GLShader;
  private fragmentShader: GLShader;
  drawFrom: number;
  drawCount: number;

  private createShaders(conf: GLProgramConfig) {
    if (conf.autoInjectHeader) {
      conf.vertexShaderString = injectVertexShaderHeaders(conf, conf.vertexShaderString);
      conf.fragmentShaderString = injectFragmentShaderHeaders(conf, conf.fragmentShaderString);
      console.log(conf.vertexShaderString);
      console.log(conf.fragmentShaderString);
    }
    this.vertexShader = new GLShader(this.renderer);
    this.vertexShader.compileShader(conf.vertexShaderString, ShaderType.vertex);
    this.fragmentShader = new GLShader(this.renderer);
    this.fragmentShader.compileShader(conf.fragmentShaderString, ShaderType.fragment);
  }

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
  }

  updateAttribute(name: string, data: any) {
    const attribute = this.attributes[name];
    if (!attribute) {
      throw 'try to set a none exist attribute';
    }
    attribute.updateData(data);
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
}
