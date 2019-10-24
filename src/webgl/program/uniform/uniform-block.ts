import { GLProgram } from "../program";
import { UniformBlockDescriptor } from "../../interface";
import { GLRenderer } from "../../gl-renderer";
import { GLUBOManager } from "../../resource-manager/ubo";

export class GLUniformBlock{
  constructor(
    program: GLProgram,
    descriptor: UniformBlockDescriptor
  ) {
    this.name = descriptor.name;
    this.renderer = program.renderer;
    this.UBOManager = this.renderer.uboManager!;
    this.gl = program.renderer.gl as WebGL2RenderingContext;
    this.uniformBlockIndex = this.gl.getUniformBlockIndex(program, this.name);
    this.bindPoint = this.uniformBlockIndex;
    this.gl.uniformBlockBinding(program.getProgram(), this.uniformBlockIndex, this.uniformBlockIndex);
  }

  readonly name: string;
  private gl: WebGL2RenderingContext;
  private renderer: GLRenderer;
  readonly uniformBlockIndex: number;
  readonly bindPoint: number;
  private UBOManager: GLUBOManager;


  set(ubo: WebGLBuffer) {
    this.UBOManager.bindProviderTo(ubo, this.bindPoint);
  }
}