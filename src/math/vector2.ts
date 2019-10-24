import { DataObject, VectorDataObject, ArrayFlattenable } from "./index";
import { Vector3 } from "./vector3";

export class Vector2
  implements
  DataObject<Vector2>,
  VectorDataObject<Vector2>,
  ArrayFlattenable<Vector2>
{
  constructor(x?: number, y?: number) {
    this.x = x || 0;
    this.y = y || 0;
  }
  x: number;
  y: number;

  get width() { return this.x; }
  set width(value: number) { this.x = value }
  get height() { return this.y; }
  set height(value: number) { this.y = value }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }

  setScalar(scalar: number) {
    this.x = scalar;
    this.y = scalar;
    return this;
  }

  clone() {
    return new Vector2(this.x, this.y);
  }
  copy(v: Vector2) {
    this.x = v.x;
    this.y = v.y;
    return this;
  }
  equals(v: Vector2) {
    return ((v.x === this.x) && (v.y === this.y));
  }

  add(v: Vector2) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  addScalar(s: number) {
    this.x += s;
    this.y += s;
    return this;
  }

  addVectors(a: Vector2, b: Vector2) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    return this;
  }

  addScaledVector(v: Vector2, s: number) {
    this.x += v.x * s;
    this.y += v.y * s;
    return this;
  }

  subScalar(s: number) {
    this.x -= s;
    this.y -= s;
    return this;
  }

  subVectors(a: Vector2, b: Vector2) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    return this;
  }

  multiply(v: Vector2) {
    this.x *= v.x;
    this.y *= v.y;
    return this;
  }

  multiplyScalar(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  divide(v: Vector2) {
    this.x /= v.x;
    this.y /= v.y;
    return this;
  }

  divideScalar(scalar: number) {
    return this.multiplyScalar(1 / scalar);
  }

  sub(v: Vector2) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  min(v: Vector2) {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    return this;
  }
  max(v: Vector2) {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    return this;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  lengthManhattan() {
    return Math.abs(this.x) + Math.abs(this.y);
  }

  normalize() {
    return this.divideScalar(this.length() || 1);
  }

  clamp(min: Vector2, max: Vector2) {
    // assumes min < max, componentwise
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    return this;
  }
  clampScalar(minVal: number, maxVal: number) {
    tempMin.set(minVal, minVal);
    tempMax.set(maxVal, maxVal);
    return this.clamp(tempMin, tempMax);
  }
  clampLength(min: number, max: number) {
    var length = this.length();
    return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
  }

  public rotate(radians: number, anchor?: Vector2): Vector2 {
    anchor = anchor || new Vector2();
    const v = anchor.sub(this).multiplyScalar(-1);
    const x = v.x;
    const y = v.y;
    const c = Math.cos(radians);
    const s = Math.sin(radians);
    this.x = x * c - y * s;
    this.y = x * s + y * c;
    return this;
  }

  floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
  }
  ceil() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
  }
  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }
  roundToZero() {
    this.x = (this.x < 0) ? Math.ceil(this.x) : Math.floor(this.x);
    this.y = (this.y < 0) ? Math.ceil(this.y) : Math.floor(this.y);
    return this;
  }

  negate() {
    this.x = - this.x;
    this.y = - this.y;
    return this;
  }

  dot(v: Vector2) {
    return this.x * v.x + this.y * v.y;
  }

  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }


  angle() {
    // computes the angle in radians with respect to the positive x-axis
    var angle = Math.atan2(this.y, this.x);
    if (angle < 0) angle += 2 * Math.PI;
    return angle;
  }

  distanceTo(v: Vector2) {
    return Math.sqrt(this.distanceToSquared(v));
  }

  distanceToSquared(v: Vector2) {
    var dx = this.x - v.x, dy = this.y - v.y;
    return dx * dx + dy * dy;
  }

  distanceToManhattan(v: Vector2) {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
  }

  setLength(length: number) {
    return this.normalize().multiplyScalar(length);
  }

  lerp(v: Vector2, alpha: number) {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    return this;
  }

  lerpVectors(v1: Vector2, v2: Vector2, alpha: number) {
    return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
  }

  rotateAround(center: Vector3, angle: number) {
    var c = Math.cos(angle), s = Math.sin(angle);
    var x = this.x - center.x;
    var y = this.y - center.y;
    this.x = x * c - y * s + center.x;
    this.y = x * s + y * c + center.y;
    return this;
  }

  fromArray(array: number[], offset?: number) {
    if (offset === undefined) offset = 0;
    this.x = array[offset];
    this.y = array[offset + 1];
    return this;
  }

  toArray(array?: number[], offset?: number) {
    if (array === undefined) array = [];
    if (offset === undefined) offset = 0;
    array[offset] = this.x;
    array[offset + 1] = this.y;
    return array;
  }

  getTypedArrayData(): Readonly<Float32Array> {
    return new Float32Array([this.x, this.y]);
  }

  static flatten(v: Vector2, array: number[]) {
    return v.toArray(array, 0);
  }

}

const tempMin = new Vector2();
const tempMax = new Vector2();

