
import { generateUUID } from "../math";
import { Nullable } from "../type";
import { GLProgramConfig, GLProgram } from "../webgl/program";
import { ShaderGraph } from "../shader-graph/shader-graph";
import { Observable } from "./observable";
import { RenderEngine } from "../engine/render-engine";

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

  baseProgramInputsCache: Nullable<any> = null
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
    this.baseProgramInputsCache = this.graph.collectInputs();
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
