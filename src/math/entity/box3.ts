import { Vector3 } from "../vector3";

export class Box3 {
  constructor(min?: Vector3, max?: Vector3) {
    if (min !== undefined) {
      this.min.copy(min);
      this.max.copy(max);
    }
  }

  min: Vector3 = new Vector3();
  max: Vector3 = new Vector3();

  clone(): Box3 {
    const b = new Box3();
    return b.copy(this);
  }

  copy(box: Box3): Box3 {
    this.min.copy(box.min);
    this.max.copy(box.max);
    return this;
  }

  makeEmpty(): Box3 {
    this.min.x = this.min.y = this.min.z = + Infinity;
    this.max.x = this.max.y = this.max.z = - Infinity;
    return this;
  }

  isEmpty() {
    // this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes
    return (this.max.x < this.min.x) || (this.max.y < this.min.y) || (this.max.z < this.min.z);
  }

  getCenter(target: Vector3) {
    return this.isEmpty() ? target.set(0, 0, 0) : target.addVectors(this.min, this.max).multiplyScalar(0.5);
  }

}