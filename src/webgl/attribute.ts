import { GLDataType } from "./shader-util";
import { GLProgram } from "./program";
import { BufferData } from "../core/buffer-data";

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
  data: BufferData;
  type: GLDataType;
  count: number = 0;
  stride: number = 1;

  get shouldUpdate() {
    return this.data.shouldUpdate;
  }

  updateData(data: BufferData) {
    if (this.data!== undefined && !this.shouldUpdate) {
      return;
    }
    const gl = this.gl;
    const buffer = gl.createBuffer();
    this.data = data;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data.data, gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.location, this.descriptor.stride, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.location);
  }

}