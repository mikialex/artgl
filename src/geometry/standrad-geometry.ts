import { Geometry } from "../core/geometry";

export class StandradGeometry extends Geometry{
  constructor() {
    super();
  }


  updateBoundingShere() { }
  updateAABBBox() { }

  populate() {
    throw 'not have genenate methods'
  }
}