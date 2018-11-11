import { GLProgram } from "../program";
import { findUniformSetter, findUniformFlattener, findUniformDiffer, findUniformCopyer } from "./uniform-util";
import { GLDataType } from "../shader-util";

export type uniformUploadType = number | Float32Array 
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
    this.location = this.gl.getUniformLocation(glProgram, descriptor.name);
    if (this.location === null) {
      // if you declare a uniform , but not realy used in shader
      // that will may cause null location
      console.warn('create uniform fail: ', descriptor.name);
    }
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
  location: WebGLUniformLocation;
  value: T;
  lastReceiveData: uniformUploadType;
  receiveData: uniformUploadType;
  descriptor: UniformDescriptor<T>;
  private setter: (gl: WebGLRenderingContext, localtion: WebGLUniformLocation, data: uniformUploadType) => void;
  private flattener: flattenerType
  private differ;
  private copyer;
  set(value: T) {
    this.receiveData = this.flattener(value, this.receiveData);
    const diffResult = true;
    if (diffResult) {
      if (this.lastReceiveData === undefined || this.differ(this.receiveData, this.lastReceiveData)) {
        this.setter(this.gl, this.location, this.receiveData);
        this.lastReceiveData = this.copyer(this.receiveData, this.lastReceiveData);
      }
    } else {
      this.setter(this.gl, this.location, this.receiveData);
    }
  }

}

//// type checking
// const uni = new GLUniform(undefined, {
//   name: 'ddd',
//   type: GLDataType.float,
//   default: 1
// })
// uni.set(1);

// class test<T, K extends keyof T>{
//   constructor(conf: T, names:K[]) {
    
//   }
//   conf: T
  
//   set(key:K, value: T[K]) {
//     this.conf[key] = value;
//   }

// }

// interface inter{
//   a: string;
//   b: number
// }

// const a = new test({a:'', b:123}, ['a', 'b'])

// a.set('a', 23)

// a.set('b', 2)