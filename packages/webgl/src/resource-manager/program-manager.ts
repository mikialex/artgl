import { GLRenderer } from "../gl-renderer";
import { GLProgram } from "../program/program";
import { GLReleasable, ShadingProvider } from "../interface";

export class GLProgramManager implements GLReleasable {
  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
  }

  readonly renderer: GLRenderer
  
  private programs: Map<ShadingProvider, GLProgram> = new Map();
  private programsVersion: Map<ShadingProvider, number> = new Map();

  getProgram(shading: ShadingProvider, useUBO:boolean) {
    const program = this.programs.get(shading);
    if (program === undefined) {
      return this.createProgram(shading, useUBO);
    }

    if (shading.getVersion() !== this.programsVersion.get(shading)) {
      this.deleteProgram(shading)
      return this.createProgram(shading, useUBO);
    }

    return program
  }

  deleteProgram(shading: ShadingProvider) {
    const program = this.programs.get(shading);
    if (program === undefined) {
      return;
    }
    program.dispose();
    this.programs.delete(shading);
    this.programsVersion.delete(shading);
  }

  private createProgram(shading: ShadingProvider, useUBO:boolean): GLProgram {
    const programConfig = shading.getProgramConfig(this.renderer.ctxVersion === 2, useUBO);
    const program = new GLProgram(this.renderer, programConfig);
    this.programs.set(shading, program);
    this.programsVersion.set(shading, shading.getVersion());
    return program;
  }

  get compiledProgramsCount() {
    return this.programs.size;
  }

  releaseGL() {
    this.programs.forEach(program => {
      program.dispose();
    })
    this.programs = new Map();
    this.programsVersion = new Map();
  }

}