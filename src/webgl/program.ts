import { GLRenderer } from "../renderer/webgl-renderer";
import { GLShader, ShaderType } from "./shader";
import { generateUUID } from "../math";
import { Geometry } from "../core/geometry";
import { injectVertexShaderHeaders, injectFragmentShaderHeaders, GLDataType, GLData } from "./shader-util";
import { GLUniform, UniformDescriptor } from "./uniform/uniform";
import { AttributeDescriptor, GLAttribute } from "./attribute";
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
    console.log(this);
    if (config.autoInjectHeader) {
      config.vertexShaderString = injectVertexShaderHeaders(config, config.vertexShaderString);
      config.fragmentShaderString = injectFragmentShaderHeaders(config, config.fragmentShaderString);
    }
    console.log(config.vertexShaderString);
    console.log(config.fragmentShaderString);

    this.createShaders(config);
    this.createProgram(this.vertexShader, this.fragmentShader);
    this.createGLResource(config);
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
  getRenderer() { return this.renderer };
  private program: WebGLProgram;
  private config: GLProgramConfig;
  private attributes: { [index: string]: GLAttribute }= {};
  private uniforms: { [index: string]: GLUniform<any> } = {};
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

  // /**
  //  * set a giving geometry's data to this program's attribute
  //  *
  //  * @param {Geometry} geometry
  //  * @memberof GLProgram
  //  */
  // setGeometryData(geometry: Geometry) {
  //   this.drawCount = geometry.drawCount;
  //   this.drawFrom = geometry.drawFrom;
  //   geometry.attributesConfig.attributeList.forEach(att => {
  //     switch (att.usage) {
  //       case AttributeUsage.position:
  //         this.setAttribute(this.attributeMap[AttributeUsage.position],
  //           geometry.attributes.position.data);  
  //         break;

  //       case AttributeUsage.normal:
  //         this.setAttribute(this.attributeMap[AttributeUsage.normal],
  //           geometry.attributes.normal.data);  
  //         break;

  //       case AttributeUsage.uv:
  //         this.setAttribute(this.attributeMap[AttributeUsage.uv],
  //           geometry.attributes.uv.data);  
  //         break;

  //       default:
  //         break;
  //     }
  //   });
  // }

  setDrawRange(start:number, count:number) {
    this.drawFrom = start;
    this.drawCount = count;
  }

  setUniform(name: string, data: GLData) {
    this.uniforms[name].set(data);
  }
}
