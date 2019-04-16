import { GLDataType, getGLDataTypeStride } from "./shader-util";
import { GLProgram } from "./program";

export const enum AttributeUsage {
  position,
  normal,
  color,
  uv,
  unset
}

export interface AttributeDescriptor {
  name: string,
  type: GLDataType,
  usage: AttributeUsage
}

export class GLAttribute {
  constructor(program: GLProgram, descriptor: AttributeDescriptor) {
    this.descriptor = descriptor;
    this.name = descriptor.name;
    this.program = program;
    this.gl = program.getRenderer().gl;
    const prog = this.program.getProgram();
    this.location = this.gl.getAttribLocation(prog, descriptor.name);
    this.type = descriptor.type;
    this.isActive = this.location !== -1;
  }
  readonly name: string;
  readonly gl: WebGLRenderingContext;
  readonly program: GLProgram;
  readonly location: number; // need location type ?
  readonly descriptor: AttributeDescriptor;
  readonly type: GLDataType;
  readonly count: number = 0;
  readonly isActive: boolean;

  useBuffer(buffer: WebGLBuffer) {
    if (!this.isActive) {
      return;
    }
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(this.location, getGLDataTypeStride(this.descriptor.type), gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.location);
  }

}