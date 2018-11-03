import { GLDataType } from "./shader-util";
import { GLProgram } from "./program";

export const enum AttributeUsage {
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
    this.location = this.gl.getAttribLocation(this.program.getProgram(), descriptor.name);
  }
  private gl: WebGLRenderingContext;
  program: GLProgram;
  location: number; // need location type ?
  descriptor: AttributeDescriptor;
  type: GLDataType;
  count: number = 0;
  stride: number = 1;

  useBuffer(buffer: WebGLBuffer) {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(this.location, this.descriptor.stride, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.location);
  }

}