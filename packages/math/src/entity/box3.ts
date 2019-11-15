import { Vector3 } from "../vector3";
import { Plane } from "./plane";

export class Box3 {
  constructor(min?: Vector3, max?: Vector3) {
    if (min !== undefined && max !== undefined) {
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

  expandByPoint(point: Vector3) {
    this.min.min(point);
    this.max.max(point);
    return this;
  }

  intersectsPlane ( plane: Plane ) {

		// We compute the minimum and maximum dot product values. If those values
		// are on the same side (back or front) of the plane, then there is no intersection.
    var min, max;
    
		if ( plane.normal.x > 0 ) {
			min = plane.normal.x * this.min.x;
			max = plane.normal.x * this.max.x;
		} else {
			min = plane.normal.x * this.max.x;
			max = plane.normal.x * this.min.x;
		}

		if ( plane.normal.y > 0 ) {
			min += plane.normal.y * this.min.y;
			max += plane.normal.y * this.max.y;
		} else {
			min += plane.normal.y * this.max.y;
			max += plane.normal.y * this.min.y;
		}

		if ( plane.normal.z > 0 ) {
			min += plane.normal.z * this.min.z;
			max += plane.normal.z * this.max.z;
		} else {
			min += plane.normal.z * this.max.z;
			max += plane.normal.z * this.min.z;
		}

		return ( min <= - plane.constant && max >= - plane.constant );
	}

}