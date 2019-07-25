import { generateUUID } from "../math/index";
import { GLProgramConfig, GLProgram } from "../webgl/program";
import { RenderEngine } from "../engine/render-engine";
import { UniformProxy } from "../engine/uniform-proxy";
import { ShaderGraph } from "../shader-graph/shader-graph";
import { Nullable } from '../type';
import { Observable } from "./observable";
import { Light } from "./light";

export class DecoratorShading {
  name: string
  decoratedGraph: ShaderGraph

  /**
   * impl this to decorate your shader source
   */
  decorate(graph: ShaderGraph) {
    throw "ShaderGraphDecorator not implement"
  }
}



export class Shading {
  uuid = generateUUID();
  graph: ShaderGraph = new ShaderGraph();

  programConfigCache: Nullable<GLProgramConfig> = null;
  needRebuildShader: boolean = true;

  private decorator: DecoratorShading[] = [];

  /**
   * impl this to build your shader source
   */
  update() {
    throw "Shading not impl"
  }


  afterShaderCompiled: Observable<GLProgramConfig> = new Observable();
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
    this.afterShaderCompiled.notifyObservers(this.programConfigCache)
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

  decorate(deco: DecoratorShading): Shading{
    this.decorator.push(deco);
    return this;
  }

}

export type UniformGroup = Map<string, UniformProxy>

export class Technique {
  shading: Shading
  uniforms: UniformGroup = new Map();
  decoratedUniforms: Map<string, UniformGroup[]> = new Map();
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

  apply(light: Light): Technique {
    const name = light.shader.name;
    const uni = this.decoratedUniforms.get(name);
    if (uni === undefined) {
      throw "this technique is not decorated by Light: <name>, decorate before use it"
    }
    if (uni.length > 0) {
      throw 'light list is not support yet'
    }
    uni.push(light.uniforms)
    return this;
  }


}
