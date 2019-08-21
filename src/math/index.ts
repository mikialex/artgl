export { Vector3 } from './vector3';
export { Vector4 } from './vector4';
export { Matrix4 } from "./matrix4";
export { Euler } from "./euler";
export { Quaternion } from './quaternion';
export { generateUUID } from './uuid';
export { MathUtil } from './util';

export interface DataObject<T>{
  copy: (value: T) => void;
  clone: (value: T) => T;
  equals: (value: T) => boolean;
}

export interface ArrayFlattenable<T>{
  fromArray: (array: number[], offset?: number) => T;
  toArray: (array: number[], offset?: number) => number[];
}

export interface VectorDataObject<T>{
  normalize: () => T;
  length: () => number;
  lengthManhattan: () => number;
  min: (value: T) => T;
  max: (value: T) => T;
}