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
    this.name = descriptor.name;
    this.gl = program.renderer.gl;
    this.location = this.gl.getAttribLocation(program.getProgram(), descriptor.name);
    this.type = descriptor.type;
    this.isActive = this.location !== -1;
  }
  readonly name: string;
  readonly gl: WebGLRenderingContext;
  readonly location: number;
  readonly type: GLDataType;
  readonly count: number = 0;
  readonly isActive: boolean;

  useBuffer(buffer: WebGLBuffer) {
    if (!this.isActive) {
      return;
    }
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(this.location, getGLDataTypeStride(this.type), gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.location);
  }

  useInstanceBuffer(buffer: WebGLBuffer) {
    
  }

}