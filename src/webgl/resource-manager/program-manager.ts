import { GLRenderer } from "../gl-renderer";
import { GLProgram } from "../program/program";
import { GLReleasable } from '../../type';
import { Shading } from "../../core/shading";

export class GLProgramManager implements GLReleasable {
  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
  }

  readonly renderer: GLRenderer
  
  private programs: Map<Shading, GLProgram> = new Map();
  private programsVersion: Map<Shading, number> = new Map();

  getProgram(shading: Shading, useUBO:boolean) {
    const program = this.programs.get(shading);
    if (program === undefined) {
      return this.createProgram(shading, useUBO);
    }

    if (shading._version !== this.programsVersion.get(shading)) {
      this.deleteProgram(shading)
      return this.createProgram(shading, useUBO);
    }

    return program
  }

  deleteProgram(shading: Shading) {
    const program = this.programs.get(shading);
    if (program === undefined) {
      return;
    }
    program.dispose();
    this.programs.delete(shading);
    this.programsVersion.delete(shading);
  }

  private createProgram(shading: Shading, useUBO:boolean): GLProgram {
    const programConfig = shading.getProgramConfig(this.renderer.ctxVersion === 2, useUBO);
    const program = new GLProgram(this.renderer, programConfig);
    this.programs.set(shading, program);
    this.programsVersion.set(shading, shading._version);
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