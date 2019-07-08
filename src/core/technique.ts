import { generateUUID } from "../math/index";
import { GLProgramConfig, GLProgram, VaryingDescriptor } from "../webgl/program";
import { ARTEngine } from "../engine/render-engine";
import { UniformProxy } from "../engine/uniform-proxy";
import { AttributeDescriptor } from "../webgl/attribute";
import { UniformDescriptor, InnerUniformMapDescriptor } from "../webgl/uniform/uniform";
import { TextureDescriptor } from "../webgl/uniform/uniform-texture";
import { ShaderGraph } from "../shader-graph/shader-graph";

/**
 * Technique defined how to draw a things typically, one technique is corespondent to a gl program.
 * Program's shader and infos are defined in technique config.
 * Technique config is wrap a program config that the engine will use this to tell the
 *  under layer gl renderer to create and compiled shader.
 */
export class Technique{
  constructor() {
    // setup default uniform value
    // this.config = config;
    // if (config.uniforms !== undefined) {
    //   config.uniforms.forEach(uniform => {
    //     this.uniforms.set(uniform.name, new UniformProxy(uniform.default));
    //   })
    // }
  }

  graph: ShaderGraph = new ShaderGraph;
  name: string = "no named technique";
  uuid: string = generateUUID();
  _techniqueId: string;

  isTransparent = false;

  uniforms: Map<string, UniformProxy> = new Map();

  /**
   * impl this to build your shader source
   */
  update() {
    
  }

  getProgram(engine: ARTEngine): GLProgram {
    const program = engine.getProgram(this);
    if (program === undefined) {
      return engine.createProgram(this);
    }
    return program;
  }

  createProgramConfig(): GLProgramConfig{
    const config = this.config;
    // config.uniforms.forEach(uniform => {
    //   this.uniforms.set(uniform.name, new UniformProxy(uniform.default));
    // })
    return {
      autoInjectHeader: true,
      attributes: config.attributes,
      uniforms: config.uniforms,
      uniformsIncludes: config.uniformsIncludes,
      varyings: config.varyings,
      textures: config.textures,
      vertexShaderString: (config.vertexShaderIncludes ? config.vertexShaderIncludes : "")
         + config.vertexShaderMain,
      fragmentShaderString: (config.fragmentShaderIncludes ? config.fragmentShaderIncludes : "")
         + config.fragmentShaderMain,
      useIndex: config.useIndex
    }
  }

  dispose(engine: ARTEngine): void {
    const program = this.getProgram(engine);
    if (program) {
      program.dispose();
    }
  }

}