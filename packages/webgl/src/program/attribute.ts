import { GLProgram } from "./program";
import { GLExtList } from "../gl-info";
import { AttributeDescriptor } from "../interface";
import { Nullable } from "@artgl/shared";
import { GLDataType, getGLDataTypeStride } from "../data-type";

export class GLAttribute {
  constructor(program: GLProgram, descriptor: AttributeDescriptor, location: number) {
    this.name = descriptor.name;
    this.gl = program.renderer.gl;
    this.type = descriptor.type;
    this.location = location;

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
  private angleInstanceExt: Nullable<ANGLE_instanced_arrays>  = null;
  readonly location: number;
  readonly type: GLDataType;

  readonly asInstance: boolean = false;
  readonly instanceDivisor: number = 1;

  useBuffer(buffer: WebGLBuffer) {
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