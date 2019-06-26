import { Geometry } from "../core/geometry";
import { PrimitiveVisitor, RenderRange } from "../core/render-object";

export class StandradGeometry extends Geometry{
  constructor() {
    super();
  }


  updateBoundingShere() { }
  updateAABBBox() { }

  foreachPrimitive(visitor: PrimitiveVisitor, range: RenderRange){}

  populate() {
    throw 'not have genenate methods'
  }
}