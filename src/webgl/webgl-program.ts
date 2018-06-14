import { GLRenderer } from "../renderer/webgl-renderer";
import { GLShader, ShaderType } from "../webgl/shader";
import { generateUUID } from "../math";
import { Geometry } from "../core/geometry";
import { AttributeUsage } from "../core/attribute";
import { injectVertexShaderHeaders, injectFragmentShaderHeaders, GLDataType } from "./shader-util";

export interface AttributeDescriptor {
  name: string,
  stride: number,
  usage?: AttributeUsage
}

export interface UniformDescriptor {
  name: string,
  type: GLDataType
}

export interface VaryingDescriptor {
  name: string,
  type: GLDataType
}

export interface GLProgramConfig {
  attributes: AttributeDescriptor[];
  uniforms?: UniformDescriptor[];
  varyings?: VaryingDescriptor[];
  vertexShaderString: string;
  fragmentShaderString: string;
  autoInjectHeader: boolean
}

export class GLProgram {
  constructor(renderer: GLRenderer, config: GLProgramConfig) {
    this.renderer = renderer;
    this.id = generateUUID();
    console.log(this);
    if (config.autoInjectHeader) {
      config.vertexShaderString = injectVertexShaderHeaders(config, config.vertexShaderString);
      config.fragmentShaderString = injectFragmentShaderHeaders(config, config.fragmentShaderString);
    }
    console.log(config.vertexShaderString);
    console.log(config.fragmentShaderString);

    this.createShaders(config);
    this.createProgram(this.vertexShader, this.fragmentShader);
    this.populateDataSlot(config);
    this.config = config;
    renderer.addProgram(this);

    config.attributes.forEach(att => {
      if (att.usage !== undefined) {
        this.attributeMap[att.usage] = att.name;
      }
    });
  }
  id: number;
  private renderer: GLRenderer;
  private program: WebGLProgram;
  private config: GLProgramConfig;
  private attributes = {};
  private uniforms = {};
  private vertexShader: GLShader;
  private fragmentShader: GLShader;
  private attributeMap = {};
  drawFrom: number;
  drawCount: number;

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
    this.drawCount = geometry.drawCount;
    this.drawFrom = geometry.drawFrom;
    geometry.attributesConfig.attributeList.forEach(att => {
      switch (att.usage) {
        case AttributeUsage.position:
          this.setAttribute(this.attributeMap[AttributeUsage.position],
            geometry.attributes.position.data);  
          break;

        case AttributeUsage.normal:
          this.setAttribute(this.attributeMap[AttributeUsage.normal],
            geometry.attributes.normal.data);  
          break;

        case AttributeUsage.uv:
          this.setAttribute(this.attributeMap[AttributeUsage.uv],
            geometry.attributes.uv.data);  
          break;

        default:
          break;
      }
    });
  }

  setDrawRange(start:number, count:number) {
    this.drawFrom = start;
    this.drawCount = count;
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
