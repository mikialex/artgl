import { Quaternion } from './quaternion';
import { Matrix4 } from './Matrix4';
import { Spherical } from './Spherical';
import { DataObject, VectorDataObject, ArrayFlattenable } from './index';

export class Vector3
  implements
  DataObject<Vector3>,
  VectorDataObject<Vector3>,
  ArrayFlattenable<Vector3>
{
  private buffer: Float32Array = new Float32Array(3);
  public x: number;
  public y: number;
  public z: number;

  constructor(x?: number, y?: number, z?: number) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  }

  public set(x: number, y: number, z: number): Vector3 {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  public copy(v: Vector3): Vector3 {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  public equals(v: Vector3) {
    return ((v.x === this.x) && (v.y === this.y)) && (v.z === this.z);
  }

  public clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  public add(v: Vector3): Vector3 {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  public sub(v: Vector3): Vector3 {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  public mag(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  public length(): number {
    return Math.sqrt(this.mag());
  }

  public multiply(v: Vector3): Vector3 {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
    return this;
  }

  public multiplyScalar(scalar: number): Vector3 {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  }

  public normalize(): Vector3 {
    const inv_length = 1.0 / this.length();
    return this.multiplyScalar(inv_length);
  }

  public lengthManhattan() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }

  public min(v: Vector3) {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    this.z = Math.min(this.z, v.z);
    return this;
  }

  public max(v: Vector3) {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    this.z = Math.max(this.z, v.z);
    return this;
  }

  public clamp(min: Vector3, max: Vector3): Vector3 {
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    this.z = Math.max(min.z, Math.min(max.z, this.z));
    return this;
  }

  public dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  public crossVectors(a: Vector3, b: Vector3): Vector3 {
    const ax = a.x, ay = a.y, az = a.z;
    const bx = b.x, by = b.y, bz = b.z;
    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;
    return this;
  }

  public cross(v: Vector3): Vector3 {
    return this.crossVectors(this, v);
  }

  public setFromQuaternion(q: Quaternion): Vector3 {
    const x = this.x, y = this.y, z = this.z;
    const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

    // calculate quat * vector
    const ix = qw * x + qy * z - qz * y;
    const iy = qw * y + qz * x - qx * z;
    const iz = qw * z + qx * y - qy * x;
    const iw = - qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
    this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
    this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

    return this;
  }

  public setFromSpherical(s: Spherical): Vector3 {
    const sinRadius = Math.sin(s.polar) * s.radius;
    this.x = sinRadius * Math.sin(s.azim);
    this.y = Math.cos(s.polar) * s.radius;
    this.z = sinRadius * Math.cos(s.azim);
    return this;
  }

  public applyMatrix4(m: Matrix4): Vector3 {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const e = m.elements;

    const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
    this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
    this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
    this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;

    return this;
  }

  public getBuffer() {
    if (this.buffer === undefined) {
      this.buffer = new Float32Array([this.x, this.y, this.z]);
    } else {
      this.buffer[0] = this.x;
      this.buffer[1] = this.y;
      this.buffer[2] = this.z;
    }
    return this.buffer;
  }

  fromArray(array: number[], offset?: number) {
    if (offset === undefined) offset = 0;
    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];
    return this;
  }

  toArray(array?: number[], offset?: number) {
    if (array === undefined) array = [];
    if (offset === undefined) offset = 0;
    array[offset] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;
    return array;
  }

  static flatten(v: Vector3, array: number[]) {
    return v.toArray(array, 0);
  }
}