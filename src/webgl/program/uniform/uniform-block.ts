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
    this.UBOManager = this.renderer.uboManager!;
    this.gl = program.renderer.gl as WebGL2RenderingContext;
    this.uniformBlockIndex = uniformBlockIndex;
    this.bindPoint = this.uniformBlockIndex;
    this.gl.uniformBlockBinding(program.getProgram(), this.uniformBlockIndex, this.uniformBlockIndex);
  }

  readonly name: string;
  private gl: WebGL2RenderingContext;
  private renderer: GLRenderer;
  readonly uniformBlockIndex: number;
  readonly bindPoint: number;
  private UBOManager: GLUBOManager;
  private blockedUniforms: UniformDescriptor[];

  ubo: Nullable<WebGLBuffer> = null;

  set(ubo: WebGLBuffer) {
    this.ubo = ubo;
    this.UBOManager.bindProviderTo(ubo, this.bindPoint);
  }
}