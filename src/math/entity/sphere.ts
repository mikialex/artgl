import { Vector3 } from "../vector3";

export class Sphere {
  constructor() {

  }

  center: Vector3;
  radius: number;

  clone() {
    return new Sphere().copy(this);
  }

  copy(sphere: Sphere) {
    this.center.copy(sphere.center);
    this.radius = sphere.radius;
    return this;
  }

  equals(sphere: Sphere) {
    return sphere.center.equals(this.center) && (sphere.radius === this.radius);
  }
}