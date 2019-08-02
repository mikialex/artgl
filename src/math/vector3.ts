import { Quaternion } from './quaternion';
import { Matrix4 } from '../math';
import { Spherical } from './Spherical';
import { DataObject, VectorDataObject, ArrayFlattenable } from './index';

export class Vector3
  implements
  DataObject<Vector3>,
  VectorDataObject<Vector3>,
  ArrayFlattenable<Vector3>
{
  x: number;
  y: number;
  z: number;

  constructor(x?: number, y?: number, z?: number) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  }

  set(x: number, y: number, z: number): Vector3 {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  setAll(x: number): Vector3 {
    this.x = x;
    this.y = x;
    this.z = x;
    return this;
  }

  copy(v: Vector3): Vector3 {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  equals(v: Vector3) {
    return ((v.x === this.x) && (v.y === this.y)) && (v.z === this.z);
  }

  clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  add(v: Vector3): Vector3 {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  addVectors(a: Vector3, b: Vector3): Vector3 {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    this.z = a.z + b.z;
    return this;
  }

  sub(v: Vector3): Vector3 {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  subVectors(a: Vector3, b: Vector3): Vector3 {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;
    return this;
  }

  mag(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  length(): number {
    return Math.sqrt(this.mag());
  }

  multiply(v: Vector3): Vector3 {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
    return this;
  }

  multiplyScalar(scalar: number): Vector3 {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  }

  normalize(): Vector3 {
    const inv_length = 1.0 / this.length();
    return this.multiplyScalar(inv_length);
  }

  lengthManhattan() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }

  min(v: Vector3) {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    this.z = Math.min(this.z, v.z);
    return this;
  }

  max(v: Vector3) {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    this.z = Math.max(this.z, v.z);
    return this;
  }

  clamp(min: Vector3, max: Vector3): Vector3 {
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    this.z = Math.max(min.z, Math.min(max.z, this.z));
    return this;
  }

  dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  crossVectors(a: Vector3, b: Vector3): Vector3 {
    const ax = a.x, ay = a.y, az = a.z;
    const bx = b.x, by = b.y, bz = b.z;
    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;
    return this;
  }

  cross(v: Vector3): Vector3 {
    return this.crossVectors(this, v);
  }

  setFromQuaternion(q: Quaternion): Vector3 {
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

  setFromSpherical(s: Spherical): Vector3 {
    const sinRadius = Math.sin(s.polar) * s.radius;
    this.x = sinRadius * Math.sin(s.azim);
    this.y = Math.cos(s.polar) * s.radius;
    this.z = sinRadius * Math.cos(s.azim);
    return this;
  }

  applyMatrix4(m: Matrix4): Vector3 {
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

  transformDirection(m: Matrix4): Vector3 {
    // input: THREE.Matrix4 affine matrix
    // vector interpreted as a direction
    var x = this.x, y = this.y, z = this.z;
    var e = m.elements;
    this.x = e[0] * x + e[4] * y + e[8] * z;
    this.y = e[1] * x + e[5] * y + e[9] * z;
    this.z = e[2] * x + e[6] * y + e[10] * z;
    return this.normalize();
  }

  setFromMatrixPosition(m: Matrix4): Vector3 {
    var e = m.elements;
    this.x = e[12];
    this.y = e[13];
    this.z = e[14];
    return this;
  }

  project(matrixWorldInverse: Matrix4, projectionMatrix: Matrix4) {
    return this.applyMatrix4(matrixWorldInverse).applyMatrix4(projectionMatrix);
  }

  unProject(matrixWorld: Matrix4, projectionMatrix: Matrix4) {
    const tempMatrix = new Matrix4();
    tempMatrix.multiplyMatrices(matrixWorld, tempMatrix.getInverse(projectionMatrix, false));
    return this.applyMatrix4(tempMatrix);
  }

  distanceTo(v: Vector3) {
    return Math.sqrt(this.distanceToSquared(v));
  }

  distanceToSquared(v: Vector3) {
    var dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
    return dx * dx + dy * dy + dz * dz;
  }

  getBuffer(): Float32Array {
    return new Float32Array([this.x, this.y, this.z]);
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