import { Vector3 } from "../vector3";

export class Ray {
  origin: Vector3;
  direction: Vector3;

  constructor(origin?: Vector3, direction?: Vector3) {
    this.origin = (origin !== undefined) ? origin : new Vector3();
    this.direction = (direction !== undefined) ? direction : new Vector3(0, 0, 1);
  }

  clone() {
    return new Ray().copy(this);
  }

  copy(ray: Ray) {
    this.origin.copy(ray.origin);
    this.direction.copy(ray.direction);
    return this;
  }

  lookAt(v: Vector3) {
    this.direction.copy(v).sub(this.origin).normalize();
    return this;
  }

}