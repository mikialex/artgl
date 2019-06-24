import { Vector3 } from "../vector3";
import { Matrix4 } from "../matrix4";

export class Line3 {
  p1: Vector3;
  p2: Vector3;

  constructor(p1?: Vector3, p2?: Vector3) {
    this.p1 = ( p1 !== undefined ) ? p1 : new Vector3();
	  this.p2 = ( p2 !== undefined ) ? p2 : new Vector3();
    return this;
  }

  lengthSq() {
    return this.p1.distanceToSquared(this.p2);
  }

  length() {
    return this.p1.distanceTo(this.p2);
  }

  applyMatrix4 ( matrix: Matrix4 ): Line3 {
		this.p1.applyMatrix4( matrix );
		this.p2.applyMatrix4( matrix );
		return this;
  }
  
  clone() {
    const l = new Line3();
		return l.copy( this );
	}

	copy (line: Line3 ): Line3 {
		this.p1.copy( line.p1 );
		this.p2.copy( line.p2 );
		return this;
	}

}