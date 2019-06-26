import { Geometry } from "../core/geometry";
import { RenderRange } from "../core/render-object";
import { Face3 } from "../math/entity/face3";
import { Line3 } from "../math/entity/line3";
import { Vector3 } from "../math/vector3";

export class StandradGeometry extends Geometry {
  constructor() {
    super();
  }


  updateBoundingShere() { }
  updateAABBBox() { }
  foreachFace(visitor: (face: Face3) => any, range: RenderRange) { };
  foreachLineSegment(visitor: (face: Line3) => any, range: RenderRange) { };
  foreachLineVertex(visitor: (face: Vector3) => any, range: RenderRange) { };

  populate() {
    throw 'not have genenate methods'
  }
}