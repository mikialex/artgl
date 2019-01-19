import { GLProgram } from "../program";
import { findUniformSetter, findUniformFlattener, findUniformDiffer, findUniformCopyer } from "./uniform-util";
import { GLDataType } from "../shader-util";

export type uniformUploadType = number | Float32Array | number[]
export type flattenerType= (value: any, receiveData: uniformUploadType) => uniformUploadType;


export interface UniformDescriptor<T> {
  name: string,
  type: GLDataType,
  default: T,
  flattener?: flattenerType
}

export function createUniform<T>(program: GLProgram, descriptor: UniformDescriptor<T>): GLUniform<T>{
  return new GLUniform<T>(program, descriptor);
}

export class GLUniform<T>{
  constructor(program: GLProgram, descriptor: UniformDescriptor<T>) {
    this.program = program;
    this.gl = program.getRenderer().gl;
    const glProgram = program.getProgram();
    const location = this.gl.getUniformLocation(glProgram, descriptor.name);
    this.isActive = location !== null;
    this.location = location;
    this.setter = findUniformSetter(descriptor.type);
    this.differ = findUniformDiffer(descriptor.type);
    this.copyer = findUniformCopyer(descriptor.type);
    if (descriptor.flattener !== undefined) {
      this.flattener = descriptor.flattener;
    } else {
      this.flattener = findUniformFlattener(descriptor.type);
    }

  }
  private gl: WebGLRenderingContext;
  program: GLProgram;
  descriptor: UniformDescriptor<T>;
  location: WebGLUniformLocation;
  value: T;
  lastReceiveData: uniformUploadType;
  receiveData: uniformUploadType;
  private setter: (gl: WebGLRenderingContext, localtion: WebGLUniformLocation, data: uniformUploadType) => void;
  private flattener: flattenerType
  private differ;
  private copyer;
  isActive: boolean;

  set(value: T): void {
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

    const enableDiff = true;
    if (enableDiff) {
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
