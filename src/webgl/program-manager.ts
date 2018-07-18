import { GLRenderer } from "../renderer/webgl-renderer";
import { GLProgram } from "./program";

export class GLProgramManager{
  constructor(renderer:GLRenderer) {
    
  }
  private programs = {};

  addNewProgram(program: GLProgram) {
    this.programs[program.id] = program;
  }

  getProgramByMaterial() {
    
  }

  dispose() {
    Object.keys(this.programs).forEach(programKey => {
      const program = this.programs[programKey];
      program.dispose();
    })
  }

}