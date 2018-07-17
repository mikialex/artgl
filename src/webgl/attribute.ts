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
    this.location = this.gl.getAttribLocation(this.program, descriptor.name);
  }
  private gl: WebGLRenderingContext;
  program: GLProgram;
  location: number; // location type 
  descriptor: AttributeDescriptor;
  data: any;
  type: GLDataType;
  count: number = 0;
  stride: number = 1;

  updateData(data: any) {
    const gl = this.gl;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.location, this.descriptor.stride, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.location);
  }

}