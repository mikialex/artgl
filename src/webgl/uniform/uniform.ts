import { GLProgram } from "../program";
import { findUniformSetter, findUniformFlattener, findUniformDiffer, findUniformCopyer } from "./uniform-util";
import { GLDataType } from "../shader-util";
import { Matrix4 } from "../../math/matrix4";

export type uniformUploadType = number | Float32Array | number[]
export type flattenerType= (value: any, receiveData: uniformUploadType) => uniformUploadType;
export type setterType= (gl: WebGLRenderingContext, localtion: WebGLUniformLocation, data: uniformUploadType) => void
export type copyerType = (newValue: uniformUploadType, target: uniformUploadType) => uniformUploadType;
export type differType= (newValue: uniformUploadType, oldValue: uniformUploadType) => boolean;

export const enum InnerSupportUniform{
  MMatrix,
  VPMatrix,
  LastVPMatrix
}

export interface InnerUniformMapDescriptor{
  name: string,
  mapInner: InnerSupportUniform,     
}

export const InnerUniformMap: Map<InnerSupportUniform, UniformDescriptor> = new Map();
InnerUniformMap.set(InnerSupportUniform.MMatrix, {
  name: 'MMatrix', type: GLDataType.Mat4, default: new Matrix4()
})
InnerUniformMap.set(InnerSupportUniform.VPMatrix, {
  name: 'VPMatrix', type: GLDataType.Mat4, default: new Matrix4()
})
InnerUniformMap.set(InnerSupportUniform.LastVPMatrix, {
  name: 'LastVPMatrix', type: GLDataType.Mat4, default: new Matrix4()
})



export interface UniformDescriptor {
  name: string,
  type: GLDataType,
  default?: any,
  flattener?: flattenerType
  setter?: setterType,
  copyer?: copyerType,
  differ?: differType
  _innerGlobalUniform?: InnerSupportUniform
}


export function createUniform(program: GLProgram, descriptor: UniformDescriptor): GLUniform{
  return new GLUniform(program, descriptor);
}

export function getInnerUniformDescriptor(des: InnerUniformMapDescriptor): UniformDescriptor {
  const temdescriptor = InnerUniformMap.get(des.mapInner);
  const descriptor = {
    name: des.name,
    type: temdescriptor.type,
    default: temdescriptor.default, // TODO default seems not useful
    _innerGlobalUniform: des.mapInner
  }
  return descriptor;
}

export class GLUniform{
  constructor(program: GLProgram, descriptor: UniformDescriptor) {
    this.program = program;
    this.name = descriptor.name;
    this.gl = program.getRenderer().gl;
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
  
    this.copyer = descriptor.copyer !== undefined ?
    descriptor.copyer : findUniformCopyer(descriptor.type);

    this.innerGlobal = descriptor._innerGlobalUniform;
  }
  name: string;
  private gl: WebGLRenderingContext;
  program: GLProgram;
  descriptor: UniformDescriptor;
  private location: WebGLUniformLocation;
  innerGlobal?: InnerSupportUniform; 
  value: any;
  private lastReceiveData: uniformUploadType;
  private receiveData: uniformUploadType;
  private setter: setterType;
  private flattener: flattenerType
  private differ: differType;
  private copyer: copyerType;
  private isActive: boolean;

  set(value: any): void {
    if (!this.isActive) {
      return;
    }
    this.receiveData = this.flattener(value, this.receiveData);

    if (this.lastReceiveData === undefined) { // this uniform never uploadever
      this.lastReceiveData = this.flattener(value, this.lastReceiveData);
      this.setter(this.gl, this.location, this.receiveData);
      this.program.renderer.stat.uniformUpload++;
      return;
    }

    if (this.program.renderer.enableUniformDiff) {
      if (this.differ(this.receiveData, this.lastReceiveData)) {
        this.setter(this.gl, this.location, this.receiveData);
        this.program.renderer.stat.uniformUpload++;
        this.lastReceiveData = this.copyer(this.receiveData, this.lastReceiveData);
      }
    } else {
      this.setter(this.gl, this.location, this.receiveData);
      this.program.renderer.stat.uniformUpload++;
    }
  }

}
