import { GLDataType } from "./shader-util";
import { GLProgram } from "./program";

export const enum AttributeUsage {
  index,
  position,
  normal,
  color,
  uv
}

export interface AttributeDescriptor {
  name: string,
  type: GLDataType,
  stride: number,
  usage: AttributeUsage
}

export class GLAttribute {
  constructor(program: GLProgram, descriptor: AttributeDescriptor) {
    this.descriptor = descriptor;
    this.program = program;
    this.gl = program.getRenderer().gl;
    const prog = this.program.getProgram();
    this.location = this.gl.getAttribLocation(prog, descriptor.name);
    this.type = descriptor.type;
  }
  readonly gl: WebGLRenderingContext;
  readonly program: GLProgram;
  readonly location: number; // need location type ?
  readonly descriptor: AttributeDescriptor;
  readonly type: GLDataType;
  readonly count: number = 0;
  readonly stride: number = 1;

  useBuffer(buffer: WebGLBuffer) {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(this.location, this.descriptor.stride, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.location);
  }

}