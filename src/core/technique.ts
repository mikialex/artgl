import { generateUUID } from "../math/index";
import { GLProgramConfig, GLProgram } from "../webgl/program";
import { RenderEngine } from "../engine/render-engine";
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

  getProgram(engine: RenderEngine): GLProgram {
    if (this.needRebuildShader) {
      this.disposeProgram(engine);
    }
    let program = engine.getProgram(this);
    if (program === undefined) {
      program = engine.createProgram(this);
    }
    return program;
  }

  disposeProgram(engine: RenderEngine): void {
    engine.deleteProgram(this);
  }

  decorate(shading: Shading): Shading{
    return new Shading()
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
