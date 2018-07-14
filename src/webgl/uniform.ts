import { GLProgram } from "./program";
import { findUnifromSetter, findUnifromFlattener } from "./uniform-util";
import { GLDataType } from "./shader-util";

export type uniformUploadType = number | Float32Array 

export interface UniformDescriptor<T> {
  name: string,
  type: GLDataType,
  default: T,
  flattener?: (value: T) => uniformUploadType
}

export function createUniform<T>(program: GLProgram, descriptor: UniformDescriptor<T>): GLUniform<T>{
  return new GLUniform<T>(program, descriptor);
}

export class GLUniform<T>{
  constructor(program: GLProgram, descriptor: UniformDescriptor<T>) {
    this.program = program;
    this.gl = program.getRenderer().gl;
    this.setter = findUnifromSetter(descriptor.type);
    if (descriptor.flattener !== undefined) {
      this.flattener = descriptor.flattener;
    } else {
      this.flattener = findUnifromFlattener(descriptor.type);
    }

  }
  private gl
  program: GLProgram;
  location: WebGLUniformLocation;
  value: T;
  descriptor: UniformDescriptor<T>;
  private setter: (gl: WebGLRenderingContext, localtion: WebGLUniformLocation, data: uniformUploadType) => void;
  private flattener: (value: T) => uniformUploadType;
  set(value:T){
    this.setter(this.gl, this.location, this.flattener(value));
  }

}

//// type checking
// const uni = new GLUniform(undefined, {
//   name: 'ddd',
//   type: GLDataType.float,
//   default: 1
// })
// uni.set(1);

class test<T, K extends keyof T>{
  constructor(conf: T, names:K[]) {
    
  }
  conf: T
  
  set(key:K, value: T[K]) {
    this.conf[key] = value;
  }

}

interface inter{
  a: string;
  b: number
}

const a = new test({a:'', b:123}, ['a'])

a.set('a', 'sdsf')