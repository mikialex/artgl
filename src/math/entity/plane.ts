import { Vector3 } from "../vector3";
import { Line3 } from "./line3";
import { Box3 } from "./box3";
import { Matrix4 } from "../matrix4";
import { Sphere } from "./sphere";
import { Matrix3 } from "../matrix3";

var _vector1 = new Vector3();
var _vector2 = new Vector3();
var _normalMatrix = new Matrix3();

export class Plane {
  constructor(normal?: Vector3, constant?: number) {
    this.normal = (normal !== undefined) ? normal : new Vector3(1, 0, 0);
    this.constant = (constant !== undefined) ? constant : 0;
  }

  normal: Vector3;
  constant: number;

  setFromNormalAndCoplanarPoint(normal: Vector3, point: Vector3) {
    this.normal.copy(normal);
    this.constant = - point.dot(this.normal);
    return this;
  }

  setFromCoplanarPoints(a: Vector3, b: Vector3, c: Vector3) {

    var normal = _vector1.subVectors(c, b).cross(_vector2.subVectors(a, b)).normalize();

    // Q: should an error be thrown if normal is zero (e.g. degenerate plane)?

    this.setFromNormalAndCoplanarPoint(normal, a);

    return this;

  }

  clone() {
    return new Plane().copy(this);
  }

  copy(plane: Plane) {
    this.normal.copy(plane.normal);
    this.constant = plane.constant;
    return this;
  }

  normalize() {

    // Note: will lead to a divide by zero if the plane is invalid.

    var inverseNormalLength = 1.0 / this.normal.length();
    this.normal.multiplyScalar(inverseNormalLength);
    this.constant *= inverseNormalLength;

    return this;

  }

  // negate() {
  //   this.constant *= - 1;
  //   this.normal.negate();
  //   return this;
  // }

  distanceToPoint(point: Vector3) {
    return this.normal.dot(point) + this.constant;
  }

  distanceToSphere(sphere: Sphere) {
    return this.distanceToPoint(sphere.center) - sphere.radius;
  }

  projectPoint(point: Vector3, target: Vector3) {
    return target.copy(this.normal).multiplyScalar(- this.distanceToPoint(point)).add(point);
  }

  // intersectLine(line: Line3, target: Vector3) {
  //   var direction = line.delta(_vector1);
  //   var denominator = this.normal.dot(direction);

  //   if (denominator === 0) {

  //     // line is coplanar, return origin
  //     if (this.distanceToPoint(line.start) === 0) {
  //       return target.copy(line.start);
  //     }

  //     // Unsure if this is the correct method to handle this case.
  //     return undefined;

  //   }

  //   var t = - (line.start.dot(this.normal) + this.constant) / denominator;

  //   if (t < 0 || t > 1) {

  //     return undefined;

  //   }

  //   return target.copy(direction).multiplyScalar(t).add(line.start);

  // }

  // intersectsLine(line) {
  //   // Note: this tests if a line intersects the plane, not whether it (or its end-points) are coplanar with it.
  //   var startSign = this.distanceToPoint(line.start);
  //   var endSign = this.distanceToPoint(line.end);
  //   return (startSign < 0 && endSign > 0) || (endSign < 0 && startSign > 0);
  // }

  intersectsBox(box: Box3) {
    return box.intersectsPlane(this);
  }

  intersectsSphere(sphere: Sphere) {
    return sphere.intersectsPlane(this);
  }

  coplanarPoint(target:  Vector3) {
    return target.copy(this.normal).multiplyScalar(- this.constant);
  }

  applyMatrix4(matrix: Matrix4) {

    var normalMatrix = _normalMatrix.getNormalMatrix(matrix);

    var referencePoint = this.coplanarPoint(_vector1).applyMatrix4(matrix);

    var normal = this.normal.applyMatrix3(normalMatrix).normalize();

    this.constant = - referencePoint.dot(normal);

    return this;

  }

  translate(offset: Vector3) {
    this.constant -= offset.dot(this.normal);
    return this;
  }

  equals(plane: Plane) {
    return plane.normal.equals(this.normal) && (plane.constant === this.constant);
  }

}