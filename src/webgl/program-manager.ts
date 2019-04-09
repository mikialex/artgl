import { GLRenderer } from "./gl-renderer";
import { GLProgram } from "./program";
import { GLRealeaseable } from '../type';

export class GLProgramManager implements GLRealeaseable {
  constructor(renderer: GLRenderer) {
    this.renderer = renderer;
  }
  private renderer: GLRenderer;
  private programs: Map<string, GLProgram> = new Map();

  addNewProgram(program: GLProgram) {
    this.programs.set(program.id, program);
  }

  getProgram(storeId: string) {
    return this.programs.get(storeId);
  }

  get compiledProgramsCount() {
    return this.programs.size;
  }

  releaseGL() {
    this.programs.forEach(program => {
      program.dispose();
    })
    this.programs = new Map();
  }

}