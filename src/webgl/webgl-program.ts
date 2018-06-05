import { GLRenderer } from "../renderer/webgl-renderer";
import { GLShader, ShaderType } from "../webgl/shader";
import { generateUUID } from "../math";
import { Geometry } from "../core/geometry";
import { AttributeUsage } from "../core/attribute";

export interface AttributeDescriptor {
  name: string,
  stride: number,
}

export interface UniformDescriptor {
  name: string,
  type: string
}

export interface GLProgramConfig {
  attributes: AttributeDescriptor[];
  uniforms: UniformDescriptor[];
  usageMap?: { [index: string]: string}
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
    this.populateDataSlot(config);
    this.config = config;
    renderer.addProgram(this);
  }
  id: number;
  private renderer: GLRenderer;
  private program: WebGLProgram;
  private config: GLProgramConfig;
  private attributes = {};
  private uniforms = {};
  private vertexShader: GLShader;
  private fragmentShader: GLShader;

  private createShaders(conf: GLProgramConfig) {
    this.vertexShader = new GLShader(this.renderer);
    this.vertexShader.compileRawShader(conf.vertexShaderString, ShaderType.vertex);
    this.fragmentShader = new GLShader(this.renderer);
    this.fragmentShader.compileRawShader(conf.fragmentShaderString, ShaderType.fragment);
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

  private populateDataSlot(config: GLProgramConfig) {
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

  setGeometryData(geometry: Geometry) {
    const map = this.config.usageMap;
    if (!map) {
      throw 'cant use geometry data on a program that not set usageMap'
    }
    geometry.attributesConfig.attributeList.forEach(att => {
      switch (att.usage) {
        case AttributeUsage.position:
          this.setAttribute(map.position, geometry.attributes.position.data);  
          break;

        case AttributeUsage.normal:
          this.setAttribute(map.normal, geometry.attributes.normal.data);  
          break;

        case AttributeUsage.uv:
          this.setAttribute(map.uv, geometry.attributes.uv.data);  
          break;

        default:
          break;
      }
    });
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
