import { generateUUID } from "../math/index";
import { GLProgramConfig, GLProgram } from "../webgl/program";
import { ARTEngine } from "../engine/render-engine";
import { UniformProxy } from "../engine/uniform-proxy";
import { ShaderGraph } from "../shader-graph/shader-graph";
import { Nullable } from '../type';


export class Shading {
  graph: ShaderGraph = new ShaderGraph();

  programConfigCache: Nullable<GLProgramConfig> = null;
  needRebuildShader: boolean = true;

  /**
   * impl this to build your shader source
   */
  update() {
    throw "Shading not impl"
  }

  getProgramConfig() {
  if (this.needRebuildShader) {
      this.update();
      this.programConfigCache = this.graph.compile();
      this.needRebuildShader = false;
    }
    return this.programConfigCache;
  }

  getProgram(engine: ARTEngine): GLProgram {
    if (this.needRebuildShader) {
      this.disposeProgram(engine);
    }
    let program = engine.getProgram(this);
    if (program === undefined) {
      program = engine.createProgram(this);
    }
    return program;
  }

  disposeProgram(engine: ARTEngine): void {
    engine.deleteProgram(this);
  }

  make() {

  }
}

export class Technique {
  shading: Shading
  uniforms: Map<string, UniformProxy> = new Map();
  constructor(shading: Shading) {
    this.shading = shading;
    const config = this.shading.getProgramConfig(); 
    this.uniforms = new Map();
    if (config.uniforms !== undefined) {
      config.uniforms.forEach(uni => {
        this.uniforms.set(uni.name, new UniformProxy(uni.default));
      })
    }
  }
}

/**
 * Technique defined how to draw a things typically, one technique is corespondent to a gl program.
 * Program's shader and infos are defined in technique config.
 * Technique config is wrap a program config that the engine will use this to tell the
 *  under layer gl renderer to create and compiled shader.
 */
// export class TechniqueOld{
//   constructor() {
//     this.update();
//     this.needRebuildShader = false;
//     this.createProgramConfig();
//     this.graph.compile();
//   }
//   graph: ShaderGraph = new ShaderGraph();
//   needRebuildShader: boolean = true;
//   _programConfigCache: GLProgramConfig;

//   name: string = "no named technique";
//   uuid: string = generateUUID();
//   _techniqueId: string;

//   isTransparent = false;

//   uniforms: Map<string, UniformProxy> = new Map();

//   /**
//    * impl this to build your shader source
//    */
//   update() {
//     throw "technique not impl"
//   }

//   getProgram(engine: ARTEngine): GLProgram {
//     if (this.needRebuildShader) {
//       this.disposeProgram(engine);
//       this.update();
//       this.needRebuildShader = false;
//     }
//     let program = engine.getProgram(this);
//     if (program === undefined) {
//       program = engine.createProgram(this);
//     }
//     return program;
//   }

//   createProgramConfig(): GLProgramConfig{
//     const config = this.graph.compile();
//     this.uniforms.clear();
//     config.uniforms.forEach(uniform => {
//       this.uniforms.set(uniform.name, new UniformProxy(uniform.default));
//     })
//     this._programConfigCache = config;
//     return config;
//   }

//   disposeProgram(engine: ARTEngine): void {
//     engine.deleteProgram(this);
//   }

// }