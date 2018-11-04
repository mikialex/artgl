export { Vector3 } from './vector3';
export { Matrix4 } from "./matrix4";
export { Quaternion } from './quaternion';
export { TriangleFace } from './triangle';
export { generateUUID } from './uuid';
export { MathUtil } from './util';

export interface DataObject<T>{
  copy(value: T);
  clone: (value: T) => T;
  equals: (value: T) => boolean;
}

export interface VectorDataObject<T>{
  normalize();
  length: () => number;
  lengthManhattan: () => number;
  min: (value: T) => T;
  max: (value: T) => T;
}