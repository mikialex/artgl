import { GLProgram } from "../program";
import { findUniformSetter, findUniformFlattener, findUniformDiffer, findUniformCopier } from "./uniform-util";
import { GLDataType } from "../shader-util";
import { Matrix4 } from "../../math/matrix4";
import { GLRenderer } from '../gl-renderer';
import { Vector3 } from '../../math';
import { GlobalUniforms } from "../../engine/uniform-proxy";
import { Nullable } from "../../type";

export type uniformUploadType = number | Float32Array | number[]
export type flattenerType = (value: any, receiveData?: uniformUploadType) => uniformUploadType;
export type setterType = (gl: WebGLRenderingContext, location: WebGLUniformLocation, data: uniformUploadType) => void
export type copierType = (newValue: uniformUploadType, target: uniformUploadType) => uniformUploadType;
export type differType = (newValue: uniformUploadType, oldValue: uniformUploadType) => boolean;

// export type InnerSupportUniform = keyof GlobalUniforms

// export interface InnerUniformMapDescriptor {
//   name: string,
//   mapInner: InnerSupportUniform,
// }

// export const InnerUniformMap = {
//   MMatrix: {
//     name: 'MMatrix', type: GLDataType.Mat4, default: new Matrix4()
//   },
//   VPMatrix: {
//     name: 'VPMatrix', type: GLDataType.Mat4, default: new Matrix4()
//   },
//   LastVPMatrix: {
//     name: 'LastVPMatrix', type: GLDataType.Mat4, default: new Matrix4()
//   },
//   CameraWorldPosition: {
//     name: 'CameraWorldPosition', type: GLDataType.floatVec3, default: new Vector3()
//   }
// }


export interface UniformDescriptor {
  name: string,
  type: GLDataType,
  default?: any,
  flattener?: flattenerType
  setter?: setterType,
  copier?: copierType,
  differ?: differType
}


export function createUniform(program: GLProgram, descriptor: UniformDescriptor): GLUniform {
  return new GLUniform(program, descriptor);
}

// export function getInnerUniformDescriptor(des: InnerUniformMapDescriptor): UniformDescriptor {
//   const tempDescriptor = InnerUniformMap[des.mapInner];
//   const descriptor = {
//     name: des.name,
//     type: tempDescriptor.type,
//     default: tempDescriptor.default, // TODO default seems not useful
//     _innerGlobalUniform: des.mapInner
//   }
//   return descriptor;
// }

export class GLUniform {
  constructor(program: GLProgram, descriptor: UniformDescriptor) {
    this.name = descriptor.name;
    this.renderer = program.renderer;
    this.gl = program.renderer.gl;
    const glProgram = program.getProgram();
    const location = this.gl.getUniformLocation(glProgram, descriptor.name);
    this.isActive = location !== null;
    this.location = location;

    this.flattener = descriptor.flattener !== undefined ?
      descriptor.flattener : findUniformFlattener(descriptor.type);

    this.setter = descriptor.setter !== undefined ?
      descriptor.setter : findUniformSetter(descriptor.type);

    this.differ = descriptor.differ !== undefined ?
      descriptor.differ : findUniformDiffer(descriptor.type);

    this.copier = descriptor.copier !== undefined ?
      descriptor.copier : findUniformCopier(descriptor.type);

  }
  name: string;
  private gl: WebGLRenderingContext;
  private programChangeId: number = -1;
  private renderer: GLRenderer;

  private location: Nullable<WebGLUniformLocation>;
  value: any;
  private lastReceiveData?: uniformUploadType;
  private receiveData?: uniformUploadType;
  private setter: setterType;
  private flattener: flattenerType
  private differ: differType;
  private copier: copierType;
  private isActive: boolean;

  set(value: any): void {
    if (!this.isActive) {
      return;
    }
    this.receiveData = this.flattener(value, this.receiveData);

    if (this.lastReceiveData === undefined) { // this uniform never upload
      this.lastReceiveData = this.flattener(value, this.lastReceiveData);
      this.setter(this.gl, this.location!, this.receiveData);
      this.renderer.stat.uniformUpload++;
      return;
    }

    let programSwitched = false;
    if (this.programChangeId !== this.renderer._programChangeId) {
      programSwitched = true;
      this.programChangeId = this.renderer._programChangeId;
    }

    if (this.renderer.enableUniformDiff && !programSwitched) {
      if (this.differ(this.receiveData, this.lastReceiveData)) {
        this.setter(this.gl, this.location!, this.receiveData);
        this.renderer.stat.uniformUpload++;
        this.lastReceiveData = this.copier(this.receiveData, this.lastReceiveData);
      }
    } else {
      this.setter(this.gl, this.location!, this.receiveData);
      this.renderer.stat.uniformUpload++;
    }
  }

}
