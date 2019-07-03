import { generateUUID } from "../math/index";
import { GLProgramConfig, GLProgram } from "../webgl/program";
import { ARTEngine } from "../engine/render-engine";
import { UniformProxy } from "../engine/uniform-proxy";

export interface TechniqueConfig {
  programConfig: GLProgramConfig;
}

/**
 * Technique defined how to draw a things typically, one technique is corespondent to a gl program.
 * Program's shader and infos are defined in technique config.
 * Technique config is wrap a program config that the engine will use this to tell the
 *  under layer gl renderer to create and compiled shader.
 */
export class Technique{
  constructor(config: TechniqueConfig) {
    // setup default uniform value
    this.config = config;
    if (this.config.programConfig.uniforms !== undefined) {
      this.config.programConfig.uniforms.forEach(uniform => {
        this.uniforms.set(uniform.name, new UniformProxy(uniform.default));
      })
    }
  }

  config: TechniqueConfig;
  name: string = "noname technique";
  uuid: string = generateUUID();
  _techniqueId: string;

  isTransparent = false;

  uniforms: Map<string, UniformProxy> = new Map();

  /**
   * t
   */
  getProgram(engine: ARTEngine): GLProgram {
    const program = engine.getProgram(this);
    if (program === undefined) {
      return engine.createProgram(this);
    }
    return program;
  }

  dispose(engine: ARTEngine): void {
    const program = this.getProgram(engine);
    if (program) {
      program.dispose();
    }
  }

}