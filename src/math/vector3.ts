export class Vector3 {

  constructor(public x?: number, public y?: number, public z?: number) {
    this.x = x === undefined ? 0 : x;
    this.y = x === undefined ? 0 : y;
    this.z = z === undefined ? 0 : z;
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

  public clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
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

  public min(): number {
    return Math.min(Math.min(this.x, this.y), this.z);
  }

  public max(): number {
    return Math.max(Math.max(this.x, this.y), this.z);
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
}