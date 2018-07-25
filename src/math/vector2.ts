import { DataObject } from ".";

export class Vector2 implements DataObject<Vector2>{
  constructor(x?: number, y?: number) {
    this.x = x || 0;
    this.y = y || 0;
  }
  x;
  y;

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

  sub(v: Vector2) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

}


Object.assign(Vector2.prototype, {

  addVectors: function (a, b) {

    this.x = a.x + b.x;
    this.y = a.y + b.y;

    return this;

  },

  addScaledVector: function (v, s) {

    this.x += v.x * s;
    this.y += v.y * s;

    return this;

  },

  subScalar: function (s) {

    this.x -= s;
    this.y -= s;

    return this;

  },

  subVectors: function (a, b) {

    this.x = a.x - b.x;
    this.y = a.y - b.y;

    return this;

  },

  multiply: function (v) {

    this.x *= v.x;
    this.y *= v.y;

    return this;

  },

  multiplyScalar: function (scalar) {

    this.x *= scalar;
    this.y *= scalar;

    return this;

  },

  divide: function (v) {

    this.x /= v.x;
    this.y /= v.y;

    return this;

  },

  divideScalar: function (scalar) {

    return this.multiplyScalar(1 / scalar);

  },

  min: function (v) {

    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);

    return this;

  },

  max: function (v) {

    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);

    return this;

  },

  clamp: function (min, max) {

    // assumes min < max, componentwise

    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));

    return this;

  },

  clampScalar: function () {

    var min = new Vector2();
    var max = new Vector2();

    return function clampScalar(minVal, maxVal) {

      min.set(minVal, minVal);
      max.set(maxVal, maxVal);

      return this.clamp(min, max);

    };

  }(),

  clampLength: function (min, max) {

    var length = this.length();

    return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));

  },

  floor: function () {

    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);

    return this;

  },

  ceil: function () {

    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);

    return this;

  },

  round: function () {

    this.x = Math.round(this.x);
    this.y = Math.round(this.y);

    return this;

  },

  roundToZero: function () {

    this.x = (this.x < 0) ? Math.ceil(this.x) : Math.floor(this.x);
    this.y = (this.y < 0) ? Math.ceil(this.y) : Math.floor(this.y);

    return this;

  },

  negate: function () {

    this.x = - this.x;
    this.y = - this.y;

    return this;

  },

  dot: function (v) {

    return this.x * v.x + this.y * v.y;

  },

  lengthSq: function () {

    return this.x * this.x + this.y * this.y;

  },

  length: function () {

    return Math.sqrt(this.x * this.x + this.y * this.y);

  },

  lengthManhattan: function () {

    return Math.abs(this.x) + Math.abs(this.y);

  },

  normalize: function () {

    return this.divideScalar(this.length() || 1);

  },

  angle: function () {

    // computes the angle in radians with respect to the positive x-axis

    var angle = Math.atan2(this.y, this.x);

    if (angle < 0) angle += 2 * Math.PI;

    return angle;

  },

  distanceTo: function (v) {

    return Math.sqrt(this.distanceToSquared(v));

  },

  distanceToSquared: function (v) {

    var dx = this.x - v.x, dy = this.y - v.y;
    return dx * dx + dy * dy;

  },

  distanceToManhattan: function (v) {

    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);

  },

  setLength: function (length) {

    return this.normalize().multiplyScalar(length);

  },

  lerp: function (v, alpha) {

    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;

    return this;

  },

  lerpVectors: function (v1, v2, alpha) {

    return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);

  },

  equals: function (v) {

    return ((v.x === this.x) && (v.y === this.y));

  },

  fromArray: function (array, offset) {

    if (offset === undefined) offset = 0;

    this.x = array[offset];
    this.y = array[offset + 1];

    return this;

  },

  toArray: function (array, offset) {

    if (array === undefined) array = [];
    if (offset === undefined) offset = 0;

    array[offset] = this.x;
    array[offset + 1] = this.y;

    return array;

  },

  fromBufferAttribute: function (attribute, index, offset) {

    if (offset !== undefined) {

      console.warn('THREE.Vector2: offset has been removed from .fromBufferAttribute().');

    }

    this.x = attribute.getX(index);
    this.y = attribute.getY(index);

    return this;

  },

  rotateAround: function (center, angle) {

    var c = Math.cos(angle), s = Math.sin(angle);

    var x = this.x - center.x;
    var y = this.y - center.y;

    this.x = x * c - y * s + center.x;
    this.y = x * s + y * c + center.y;

    return this;

  }

});
