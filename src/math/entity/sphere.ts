import { Vector3, Matrix4 } from "../../math";

export class Sphere {
  constructor(center?: Vector3, radius?: number) {
    if (center !== undefined) {
      this.center = center;
    }
    if (radius !== undefined) {
      this.radius = radius;
    }
  }

  center: Vector3 = new Vector3();
  radius: number = 1;

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

  applyMatrix4(matrix: Matrix4) {
    this.center.applyMatrix4(matrix);
    this.radius = this.radius * matrix.getMaxScaleOnAxis();
    return this;
  }

}