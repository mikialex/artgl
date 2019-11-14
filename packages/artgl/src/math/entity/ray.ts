import { Vector3, Matrix4 } from "../../math";
import { Sphere } from "./sphere";

const diff = new Vector3();
const edge1 = new Vector3();
const edge2 = new Vector3();
const normal = new Vector3();

const v1 = new Vector3();

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

  at(t: number, target: Vector3) {
    return target.copy(this.direction).multiplyScalar(t).add(this.origin);
  }

  intersectTriangle(
    a: Vector3, b: Vector3, c: Vector3,
    backfaceCulling: boolean, target: Vector3) {
    // from http://www.geometrictools.com/GTEngine/Include/Mathematics/GteIntrRay3Triangle3.h
    edge1.subVectors(b, a);
    edge2.subVectors(c, a);
    normal.crossVectors(edge1, edge2);

    // Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
    // E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
    //   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
    //   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
    //   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
    var DdN = this.direction.dot(normal);
    var sign;

    if (DdN > 0) {
      if (backfaceCulling) return null;
      sign = 1;
    } else if (DdN < 0) {
      sign = - 1;
      DdN = - DdN;
    } else {
      return null;
    }

    diff.subVectors(this.origin, a);
    var DdQxE2 = sign * this.direction.dot(edge2.crossVectors(diff, edge2));

    // b1 < 0, no intersection
    if (DdQxE2 < 0) {
      return null;
    }

    var DdE1xQ = sign * this.direction.dot(edge1.cross(diff));

    // b2 < 0, no intersection
    if (DdE1xQ < 0) {
      return null;
    }

    // b1+b2 > 1, no intersection
    if (DdQxE2 + DdE1xQ > DdN) {
      return null;
    }

    // Line intersects triangle, check if ray does.
    var QdN = - sign * diff.dot(normal);

    // t < 0, no intersection
    if (QdN < 0) {
      return null;
    }

    // Ray intersects triangle.
    return this.at(QdN / DdN, target);

  }

  ifIntersectSphere(sphere: Sphere) {
    return this.distanceSqToPoint(sphere.center) <= (sphere.radius * sphere.radius);
  }

  distanceToPoint(point: Vector3) {
    return Math.sqrt(this.distanceSqToPoint(point));
  }

  distanceSqToPoint(point: Vector3) {
    var directionDistance = v1.subVectors(point, this.origin).dot(this.direction);

    // point behind the ray
    if (directionDistance < 0) {
      return this.origin.distanceToSquared(point);
    }

    v1.copy(this.direction).multiplyScalar(directionDistance).add(this.origin);
    return v1.distanceToSquared(point);
  }

  applyMatrix4(matrix4: Matrix4) {
    this.origin.applyMatrix4(matrix4);
    this.direction.transformDirection(matrix4);
    return this;
  }

}