import { Vector3 } from './vector3';
import { Matrix4 } from './matrix4';
import { Euler, EulerOrder } from './euler';

const v1: Vector3 = new Vector3
let r: number = 0;
const EPS: number = 0.000001;

export class Quaternion {

  constructor(x?: number, y?: number, z?: number, w?: number) {
    this._x = x || 0;
    this._y = x || 0;
    this._z = z || 0;
    this._w = w || 1;
  }

  _x: number;
  _y: number;
  _z: number;
  _w: number;

  get x() { return this._x };
  get y() { return this._y };
  get z() { return this._z };
  get w() { return this._w };
  set x(value) { this._x = value; this.onChangeCallback(); };
  set y(value) { this._y = value; this.onChangeCallback(); };
  set z(value) { this._z = value; this.onChangeCallback(); };
  set w(value) { this._w = value; this.onChangeCallback(); };

  onChangeCallback: Function = () => { };

  set(x: number, y: number, z: number, w: number): Quaternion {
    this._x = x;
    this._y = y;
    this._z = z;
    this._w = w;
    this.onChangeCallback();
    return this;
  }

  copy(q: Quaternion): Quaternion {
    this._x = q.x;
    this._y = q.y;
    this._z = q.z;
    this._w = q.w;
    this.onChangeCallback();
    return this;
  }

  clone(): Quaternion {
    return new Quaternion(this._x, this._y, this._z, this._w);
  }

  inverse(): Quaternion {
    this._x *= -1;
    this._y *= -1;
    this._z *= -1;
    this.onChangeCallback();
    return this;
  }

  length(): number {
    return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
  }

  normalize(): Quaternion {
    let l = this.length();
    if (l === 0) {
      this._x = 0;
      this._y = 0;
      this._z = 0;
      this._w = 1;
    } else {
      l = 1 / l;
      this._x = this._x * l;
      this._y = this._y * l;
      this._z = this._z * l;
      this._w = this._w * l;
    }
    this.onChangeCallback();
    return this;
  }

  // assumes axis is normalized
  setFromAxisAngle(axis: Vector3, angle: number): Quaternion {
    const halfAngle = angle / 2;
    const s = Math.sin(halfAngle);

    this._x = axis.x * s;
    this._y = axis.y * s;
    this._z = axis.z * s;
    this._w = Math.cos(halfAngle);

    this.onChangeCallback();
    return this;
  }

  setFromUnitVectors(vFrom: Vector3, vTo: Vector3) {
    r = vFrom.dot(vTo) + 1;
    if (r < EPS) {
      r = 0;
      if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
        v1.set(- vFrom.y, vFrom.x, 0);
      } else {
        v1.set(0, - vFrom.z, vFrom.y);
      }
    } else {
      v1.crossVectors(vFrom, vTo);
    }
    this._x = v1.x;
    this._y = v1.y;
    this._z = v1.z;
    this._w = r;

    this.onChangeCallback();
    return this.normalize();
  }

  setFromRotationMatrix(m: Matrix4) {
    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
    // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)
    const te = m.elements;
    const m11 = te[0], m12 = te[4], m13 = te[8];
    const m21 = te[1], m22 = te[5], m23 = te[9];
    const m31 = te[2], m32 = te[6], m33 = te[10];
    const trace = m11 + m22 + m33;
    let s;

    if (trace > 0) {
      s = 0.5 / Math.sqrt(trace + 1.0);
      this._w = 0.25 / s;
      this._x = (m32 - m23) * s;
      this._y = (m13 - m31) * s;
      this._z = (m21 - m12) * s;
    } else if (m11 > m22 && m11 > m33) {
      s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
      this._w = (m32 - m23) / s;
      this._x = 0.25 * s;
      this._y = (m12 + m21) / s;
      this._z = (m13 + m31) / s;
    } else if (m22 > m33) {
      s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);
      this._w = (m13 - m31) / s;
      this._x = (m12 + m21) / s;
      this._y = 0.25 * s;
      this._z = (m23 + m32) / s;
    } else {
      s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);
      this._w = (m21 - m12) / s;
      this._x = (m13 + m31) / s;
      this._y = (m23 + m32) / s;
      this._z = 0.25 * s;
    }

    this.onChangeCallback();
    return this;
  }


  setFromEuler(euler: Euler, update: boolean) {

    var x = euler._x, y = euler._y, z = euler._z, order = euler.order;

    // http://www.mathworks.com/matlabcentral/fileexchange/
    // 	20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
    //	content/SpinCalc.m

    var cos = Math.cos;
    var sin = Math.sin;

    var c1 = cos(x / 2);
    var c2 = cos(y / 2);
    var c3 = cos(z / 2);

    var s1 = sin(x / 2);
    var s2 = sin(y / 2);
    var s3 = sin(z / 2);

    if (order === EulerOrder.XYZ) {

      this._x = s1 * c2 * c3 + c1 * s2 * s3;
      this._y = c1 * s2 * c3 - s1 * c2 * s3;
      this._z = c1 * c2 * s3 + s1 * s2 * c3;
      this._w = c1 * c2 * c3 - s1 * s2 * s3;

    } else if (order === EulerOrder.YXZ) {

      this._x = s1 * c2 * c3 + c1 * s2 * s3;
      this._y = c1 * s2 * c3 - s1 * c2 * s3;
      this._z = c1 * c2 * s3 - s1 * s2 * c3;
      this._w = c1 * c2 * c3 + s1 * s2 * s3;

    } else if (order === EulerOrder.ZXY) {

      this._x = s1 * c2 * c3 - c1 * s2 * s3;
      this._y = c1 * s2 * c3 + s1 * c2 * s3;
      this._z = c1 * c2 * s3 + s1 * s2 * c3;
      this._w = c1 * c2 * c3 - s1 * s2 * s3;

    } else if (order === EulerOrder.ZYX) {

      this._x = s1 * c2 * c3 - c1 * s2 * s3;
      this._y = c1 * s2 * c3 + s1 * c2 * s3;
      this._z = c1 * c2 * s3 - s1 * s2 * c3;
      this._w = c1 * c2 * c3 + s1 * s2 * s3;

    } else if (order === EulerOrder.YZX) {

      this._x = s1 * c2 * c3 + c1 * s2 * s3;
      this._y = c1 * s2 * c3 + s1 * c2 * s3;
      this._z = c1 * c2 * s3 - s1 * s2 * c3;
      this._w = c1 * c2 * c3 - s1 * s2 * s3;

    } else if (order === EulerOrder.XZY) {

      this._x = s1 * c2 * c3 - c1 * s2 * s3;
      this._y = c1 * s2 * c3 - s1 * c2 * s3;
      this._z = c1 * c2 * s3 + s1 * s2 * c3;
      this._w = c1 * c2 * c3 + s1 * s2 * s3;

    }

    if (update !== false) this.onChangeCallback();

    return this;

  }

}