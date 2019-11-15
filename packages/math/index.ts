import { FloatArray } from '@artgl/shared';

export * from './src/interface'
export { Vector2 } from './src/vector2';
export { Vector3 } from './src/vector3';
export { Vector3Observable } from './src/observable/vector3-observable';
export { Vector4 } from './src/vector4';
export { Matrix3 } from "./src/matrix3";
export { Matrix4 } from "./src/matrix4";
export { Euler } from "./src/euler";
export { Quaternion } from './src/quaternion';
export { generateUUID } from './src/uuid';
export { Spherical } from './src/spherical';
export { MathUtil } from './src/util';

export { Box3 } from './src/entity/box3';
export { Face3 } from './src/entity/face3';
export { Line3 } from './src/entity/line3';
export { Plane } from './src/entity/plane';
export { Ray } from './src/entity/ray';
export { Sphere } from './src/entity/sphere';

export interface DataObject<T>{
  copy: (value: T) => void;
  clone: (value: T) => T;
  equals: (value: T) => boolean;
}

export interface ArrayFlattenable<T = {}>{
  fromArray: (array: FloatArray, offset?: number) => T;
  toArray: (array?: FloatArray, offset?: number) => FloatArray;
}

export interface VectorDataObject<T = {}>{
  normalize: () => T;
  length: () => number;
  lengthManhattan: () => number;
  min: (value: T) => T;
  max: (value: T) => T;
}