import { GLProgram } from "../program";
import { UniformBlockDescriptor } from "../interface";
import { GLRenderer } from "../gl-renderer";

export class GLUniformBlock{
  constructor(
    program: GLProgram,
    descriptor: UniformBlockDescriptor
  ) {
    this.name = descriptor.name;
    this.renderer = program.renderer;
    this.gl = program.renderer.gl as WebGL2RenderingContext;
    this.uniformBlockIndex = this.gl.getUniformBlockIndex(program, this.name);
    this.gl.uniformBlockBinding(program.getProgram(), this.uniformBlockIndex, this.uniformBlockIndex);
  }

  readonly name: string;
  private gl: WebGL2RenderingContext;
  private renderer: GLRenderer;
  readonly uniformBlockIndex: number;

  
  set(ubo: WebGLBuffer) {
    
  }
}