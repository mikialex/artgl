import { GLRenderer } from "../renderer/webgl-renderer";
import { GLProgram } from "./program";

export class GLProgramManager{
  constructor(renderer:GLRenderer) {
    
  }
  private programs = {};

  addNewProgram(program: GLProgram) {
    this.programs[program.id] = program;
  }

  getProgram() {
    
  }

  dispose() {
    
  }

}