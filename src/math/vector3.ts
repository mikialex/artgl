export class Vector3 {
  constructor(x?: number, y?: number, z?: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  x = 0;
  y = 0;
  z = 0;

  clone() {
    return new Vector3(this.x, this.y, this.z);
  }

  copy(v: Vector3) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  add(v: Vector3) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }
  addScalar(scalar: number) {
    this.x += scalar;
    this.y += scalar;
    this.z += scalar;
    return this;
  }



  subtract(v: Vector3) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }


  multiply(v: Vector3) {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
    return this;
  }
  multiplyScalar(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  }

  multiplyVectors(a: Vector3, b: Vector3) {
    this.x = a.x * b.x;
    this.y = a.y * b.y;
    this.z = a.z * b.z;
    return this;
  }


}