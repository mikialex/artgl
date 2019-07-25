
import { generateUUID } from "../math";
import { Nullable } from "../type";
import { GLProgramConfig, GLProgram } from "../webgl/program";
import { ShaderGraph } from "../shader-graph/shader-graph";
import { Observable } from "./observable";
import { RenderEngine } from "../engine/render-engine";
import { UniformProxy } from "../engine/uniform-proxy";

export interface ShaderUniformProvider{
  providerName: string;

  /**
  * impl this to decorate your shader source, add uniform input
  */
  decorate(graph: ShaderGraph): void;

  uniforms: Map<string, any>;
}

export class Shading {
  uuid = generateUUID();
  graph: ShaderGraph = new ShaderGraph();

  programConfigCache: Nullable<GLProgramConfig> = null;
  needRebuildShader: boolean = true;

  uniformProvider: ShaderUniformProvider[] = [];

  decorate(deco: ShaderUniformProvider): Shading {
    this.uniformProvider.push(deco);
    return this;
  }

  afterShaderCompiled: Observable<GLProgramConfig> = new Observable();
  build() {
    this.graph.reset()
    this.uniformProvider.forEach(provider => {
      provider.decorate(this.graph);
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

}
