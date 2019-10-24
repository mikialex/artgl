import { GLProgram } from "./program";
import { Nullable } from "../../type";
import { GLExtList } from "../gl-info";
import { GLDataType, getGLDataTypeStride } from "../../core/data-type";
import { AttributeDescriptor } from "../interface";

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
      if (descriptor.instanceDivisor !== undefined) {
        this.instanceDivisor = descriptor.instanceDivisor
      }
    }
  }
  
  readonly name: string;
  readonly gl: WebGLRenderingContext;
  private angleInstanceExt: Nullable<ANGLE_instanced_arrays> = null;
  readonly location: number;
  readonly type: GLDataType;
  readonly isActive: boolean;

  readonly asInstance: boolean = false;
  readonly instanceDivisor: number = 1;

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