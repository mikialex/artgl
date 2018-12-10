import { Vector3 } from "../vector3";

export class Box3{
  constructor(min?: Vector3, max?: Vector3) {
    this.min.copy(min);
    this.max.copy(max);
  }

  min: Vector3 = new Vector3();
  max: Vector3 = new Vector3();
}