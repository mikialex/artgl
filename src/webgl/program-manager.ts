import { GLRenderer } from "./webgl-renderer";
import { GLProgram } from "./program";

export class GLProgramManager{
  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
  }
  private renderer;
  private programs: { [index: string]: GLProgram } = {};

  addNewProgram(program: GLProgram) {
    this.programs[program.id] = program;
  }

  getProgram(storeId: string) {
    return this.programs[storeId];
  }

  dispose() {
    Object.keys(this.programs).forEach(programKey => {
      const program = this.programs[programKey];
      program.dispose();
    })
  }

}