import { Vector3 } from "../math";
import { Quaternion } from "./quaternion";
import { DataObject, ArrayFlattenable } from "./index";

const tempX: Vector3 = new Vector3();
const tempY: Vector3 = new Vector3();
const tempZ: Vector3 = new Vector3();

export class Matrix4
  implements
  DataObject<Matrix4>,
  ArrayFlattenable<Matrix4>
{
  constructor() {

  }

  copy(m: Matrix4) {
    var te = this.elements;
    var me = m.elements;
    te[0] = me[0]; te[1] = me[1]; te[2] = me[2]; te[3] = me[3];
    te[4] = me[4]; te[5] = me[5]; te[6] = me[6]; te[7] = me[7];
    te[8] = me[8]; te[9] = me[9]; te[10] = me[10]; te[11] = me[11];
    te[12] = me[12]; te[13] = me[13]; te[14] = me[14]; te[15] = me[15];
    return this;
  }

  clone() {
    return new Matrix4().fromArray(this.elements);
  }

  equals(matrix: Matrix4): boolean {
    var te = this.elements;
    var me = matrix.elements;
    for (var i = 0; i < 16; i++) {
      if (te[i] !== me[i]) return false;
    }
    return true;
  }

  elements: number[] = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  ]

  set(n11: number, n12: number, n13: number, n14: number,
    n21: number, n22: number, n23: number, n24: number,
    n31: number, n32: number, n33: number, n34: number,
    n41: number, n42: number, n43: number, n44: number) {
    const te = this.elements;
    te[0] = n11; te[4] = n12; te[8] = n13; te[12] = n14;
    te[1] = n21; te[5] = n22; te[9] = n23; te[13] = n24;
    te[2] = n31; te[6] = n32; te[10] = n33; te[14] = n34;
    te[3] = n41; te[7] = n42; te[11] = n43; te[15] = n44;
    return this;
  }

  compose(position: Vector3, quaternion: Quaternion, scale: Vector3) {
    this.makeRotationFromQuaternion(quaternion);
    this.scale(scale.x, scale.y, scale.z);
    this.setPosition(position.x, position.y, position.z);
    return this;
  }

  identity() {
    this.set(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    );
    return this;
  }

  makePerspective(left: number, right: number, top: number,
    bottom: number, near: number, far: number) {
    const te = this.elements;
    const x = 2 * near / (right - left);
    const y = 2 * near / (top - bottom);

    const a = (right + left) / (right - left);
    const b = (top + bottom) / (top - bottom);
    const c = - (far + near) / (far - near);
    const d = - 2 * far * near / (far - near);

    te[0] = x; te[4] = 0; te[8] = a; te[12] = 0;
    te[1] = 0; te[5] = y; te[9] = b; te[13] = 0;
    te[2] = 0; te[6] = 0; te[10] = c; te[14] = d;
    te[3] = 0; te[7] = 0; te[11] = - 1; te[15] = 0;

    return this;
  }

  makeOrthographic(left: number, right: number, top: number,
    bottom: number, near: number, far: number) {
    var te = this.elements;
    var w = 1.0 / (right - left);
    var h = 1.0 / (top - bottom);
    var p = 1.0 / (far - near);

    var x = (right + left) * w;
    var y = (top + bottom) * h;
    var z = (far + near) * p;

    te[0] = 2 * w; te[4] = 0; te[8] = 0; te[12] = - x;
    te[1] = 0; te[5] = 2 * h; te[9] = 0; te[13] = - y;
    te[2] = 0; te[6] = 0; te[10] = - 2 * p; te[14] = - z;
    te[3] = 0; te[7] = 0; te[11] = 0; te[15] = 1;

    return this;
  }

  multiplyMatrices(a: Matrix4, b: Matrix4) {

    var ae = a.elements;
    var be = b.elements;
    var te = this.elements;

    var a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
    var a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
    var a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
    var a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

    var b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
    var b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
    var b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
    var b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];

    te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

    te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

    te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

    te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

    return this;

  }

  getInverse(m: Matrix4, throwOnDegenerate: boolean) {
    // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
    var te = this.elements,
      me = m.elements,

      n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3],
      n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7],
      n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11],
      n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15],

      t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
      t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
      t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
      t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

    var det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

    if (det === 0) {
      var msg = "Matrix4.getInverse(): can't invert matrix, determinant is 0";
      if (throwOnDegenerate === true) {
        throw new Error(msg);
      } else {
        console.warn(msg);
      }
      return this.identity();
    }

    var detInv = 1 / det;

    te[0] = t11 * detInv;
    te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
    te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
    te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;

    te[4] = t12 * detInv;
    te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
    te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
    te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;

    te[8] = t13 * detInv;
    te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
    te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
    te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;

    te[12] = t14 * detInv;
    te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
    te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
    te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;

    return this;
  }

  public lookAt(origin: Vector3, target: Vector3, up: Vector3): Matrix4 {

    const te = this.elements;

    tempZ.copy(origin).sub(target);
    if (tempZ.mag() === 0) {
      tempZ.z = 1;
    }

    tempZ.normalize();
    tempX.crossVectors(up, tempZ);
    if (tempX.mag() === 0) {
      if (Math.abs(up.z) === 1) {
        tempZ.x += 0.0001;
      } else {
        tempZ.z += 0.0001;
      }
      tempZ.normalize();
      tempX.crossVectors(up, tempZ);
    }

    tempX.normalize();
    tempY.crossVectors(tempZ, tempX);

    te[0] = tempX.x; te[4] = tempY.x; te[8] = tempZ.x;
    te[1] = tempX.y; te[5] = tempY.y; te[9] = tempZ.y;
    te[2] = tempX.z; te[6] = tempY.z; te[10] = tempZ.z;

    return this;
  };

  scale(x: number, y: number, z: number) {
    const te = this.elements;
    te[0] *= x; te[4] *= y; te[8] *= z;
    te[1] *= x; te[5] *= y; te[9] *= z;
    te[2] *= x; te[6] *= y; te[10] *= z;
    te[3] *= x; te[7] *= y; te[11] *= z;
    return this;
  }

  setPosition(x: number, y: number, z: number) {
    var te = this.elements;
    te[12] = x;
    te[13] = y;
    te[14] = z;
    return this;
  }

  getMaxScaleOnAxis() {
    var te = this.elements;
    var scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
    var scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
    var scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];
    return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
  }

  makeRotationFromQuaternion(q: Quaternion) {
    var te = this.elements;

    var x = q.x, y = q.y, z = q.z, w = q.w;
    var x2 = x + x, y2 = y + y, z2 = z + z;
    var xx = x * x2, xy = x * y2, xz = x * z2;
    var yy = y * y2, yz = y * z2, zz = z * z2;
    var wx = w * x2, wy = w * y2, wz = w * z2;

    te[0] = 1 - (yy + zz);
    te[4] = xy - wz;
    te[8] = xz + wy;

    te[1] = xy + wz;
    te[5] = 1 - (xx + zz);
    te[9] = yz - wx;

    te[2] = xz - wy;
    te[6] = yz + wx;
    te[10] = 1 - (xx + yy);

    // last column
    te[3] = 0;
    te[7] = 0;
    te[11] = 0;

    // bottom row
    te[12] = 0;
    te[13] = 0;
    te[14] = 0;
    te[15] = 1;
    return this;
  }

  makeTranslation(x: number, y: number, z: number) {
    this.set(
      1, 0, 0, x,
      0, 1, 0, y,
      0, 0, 1, z,
      0, 0, 0, 1
    );
    return this;
  }

  makeRotationX(theta: number) {
    var c = Math.cos(theta), s = Math.sin(theta);
    this.set(
      1, 0, 0, 0,
      0, c, - s, 0,
      0, s, c, 0,
      0, 0, 0, 1
    );
    return this;
  }

  makeRotationY(theta: number) {
    var c = Math.cos(theta), s = Math.sin(theta);
    this.set(
      c, 0, s, 0,
      0, 1, 0, 0,
      - s, 0, c, 0,
      0, 0, 0, 1
    );
    return this;
  }

  makeRotationZ(theta: number) {
    var c = Math.cos(theta), s = Math.sin(theta);
    this.set(
      c, - s, 0, 0,
      s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    );
    return this;
  }

  toArray(array: number[], offset: number) {

    if (array === undefined) array = [];
    if (offset === undefined) offset = 0;

    var te = this.elements;

    array[offset] = te[0];
    array[offset + 1] = te[1];
    array[offset + 2] = te[2];
    array[offset + 3] = te[3];

    array[offset + 4] = te[4];
    array[offset + 5] = te[5];
    array[offset + 6] = te[6];
    array[offset + 7] = te[7];

    array[offset + 8] = te[8];
    array[offset + 9] = te[9];
    array[offset + 10] = te[10];
    array[offset + 11] = te[11];

    array[offset + 12] = te[12];
    array[offset + 13] = te[13];
    array[offset + 14] = te[14];
    array[offset + 15] = te[15];

    return array;

  }

  fromArray(array: number[], offset?: number) {
    if (offset === undefined) offset = 0;
    for (var i = 0; i < 16; i++) {
      this.elements[i] = array[i + offset];
    }
    return this;
  }

  static flatten(v: Matrix4, array: number[]) {
    return v.toArray(array, 0);
  }


}