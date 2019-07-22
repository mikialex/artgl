import { generateUUID } from "../math/index";
import { GLProgramConfig, GLProgram } from "../webgl/program";
import { RenderEngine } from "../engine/render-engine";
import { UniformProxy } from "../engine/uniform-proxy";
import { ShaderGraph, ShaderGraphDecorator } from "../shader-graph/shader-graph";
import { Nullable } from '../type';


export class Shading {
  uuid = generateUUID();
  graph: ShaderGraph = new ShaderGraph();

  programConfigCache: Nullable<GLProgramConfig> = null;
  needRebuildShader: boolean = true;

  private decorator: ShaderGraphDecorator[] = [];

  /**
   * impl this to build your shader source
   */
  update() {
    throw "Shading not impl"
  }

  build() {
    this.update();
    this.decorator.forEach(deco => {
      deco.decorate(this.graph);
    })
  }

  getProgramConfig() {
  if (this.needRebuildShader) {
      this.build();
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

  decorate(deco: ShaderGraphDecorator): Shading{
    this.decorator.push(deco);
    return this;
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
