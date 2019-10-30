import { GLProgram } from "../program";
import { UniformBlockDescriptor, UniformDescriptor } from "../../interface";
import { GLRenderer } from "../../gl-renderer";
import { GLUBOManager } from "../../resource-manager/ubo";
import { Nullable } from "../../../type";

export class GLUniformBlock{
  constructor(
    program: GLProgram,
    descriptor: UniformBlockDescriptor,
    uniformBlockIndex: number
  ) {
    this.name = descriptor.name;
    this.blockedUniforms = descriptor.uniforms;
    this.renderer = program.renderer;
    this.program = program;
    this.UBOManager = this.renderer.uboManager!;
    this.gl = program.renderer.gl as WebGL2RenderingContext;
    this.uniformBlockIndex = uniformBlockIndex;
    this.bindPoint = this.uniformBlockIndex;
    this.gl.uniformBlockBinding(program.getProgram(), this.uniformBlockIndex, this.uniformBlockIndex);
  }

  readonly name: string;
  private gl: WebGL2RenderingContext;
  private program: GLProgram;
  private renderer: GLRenderer;
  readonly uniformBlockIndex: number;
  readonly bindPoint: number;
  private UBOManager: GLUBOManager;
  readonly blockedUniforms: UniformDescriptor[];

  ubo: Nullable<WebGLBuffer> = null;

  set(ubo: WebGLBuffer) {
    this.ubo = ubo;
    this.UBOManager.bindProviderTo(ubo, this.bindPoint);
  }

  queryLayout() {
    const all: number = this.gl.getActiveUniformBlockParameter(
      this.program.getProgram(), this.bindPoint,
      this.gl.UNIFORM_BLOCK_DATA_SIZE)
    
    const index = this.gl.getActiveUniformBlockParameter(
      this.program.getProgram(), this.bindPoint,
      this.gl.UNIFORM_BLOCK_ACTIVE_UNIFORM_INDICES)
    
    const offsets = this.gl.getActiveUniformBlockParameter(
      this.program.getProgram(), index,
      this.gl.UNIFORM_OFFSET)
    
    return { all, offsets };
  }
}