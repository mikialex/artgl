import { GLDataType, getGLDataTypeStride } from "./shader-util";
import { GLProgram } from "./program";
import { Nullable } from "../type";
import { GLExtList } from "./gl-info";

export const enum CommonAttribute {
  position = 'position',
  normal = 'normal',
  color = 'color',
  uv = 'uv',
}

export interface AttributeDescriptor {
  name: string,
  type: GLDataType,
  asInstance?: boolean, // default false
  instanceDivisor?: number // default 1
}

export class GLAttribute {
  constructor(program: GLProgram, descriptor: AttributeDescriptor) {
    this.name = descriptor.name;
    this.gl = program.renderer.gl;
    this.location = this.gl.getAttribLocation(program.getProgram(), descriptor.name);
    this.type = descriptor.type;
    this.isActive = this.location !== -1;

    const ext = program.renderer.glInfo.getExtension(GLExtList.ANGLE_instanced_arrays);
    if (ext !== undefined) {
      this.angleInstanceExt = ext;
    }

    if (descriptor.asInstance === true) {
      program.useInstance = true;
      this.asInstance = descriptor.asInstance
      this.instanceDivisor = descriptor.instanceDivisor
    }
  }
  
  readonly name: string;
  readonly gl: WebGLRenderingContext;
  private angleInstanceExt: Nullable<ANGLE_instanced_arrays> = null;
  readonly location: number;
  readonly type: GLDataType;
  readonly isActive: boolean;

  readonly asInstance: boolean = false;
  readonly instanceDivisor: number;

  useBuffer(buffer: WebGLBuffer) {
    if (!this.isActive) {
      return;
    }
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(this.location, getGLDataTypeStride(this.type), gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.location);
    if (this.asInstance) {
      if (this.angleInstanceExt !== null) {
        this.angleInstanceExt.vertexAttribDivisorANGLE(this.location, this.instanceDivisor);
      } else {
        throw "instance not support"
      }
    }
    
  }

}