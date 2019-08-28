import { Geometry } from "../core/geometry";

export class NoneIndexedGeometry extends Geometry{
  updateAABBBox(): void {
    throw new Error("Method not implemented.");
  }  updateBoundingSphere(): void {
    throw new Error("Method not implemented.");
  }

  shape(): void {
    throw new Error("Method not implemented.");
  }

  foreachFace(visitor: (face: import("../math/entity/face3").Face3) => , range?: import("../artgl").RenderRange | undefined) {
    throw new Error("Method not implemented.");
  }

  foreachLineSegment(visitor: (face: import("../math/entity/line3").Line3) => , range?: import("../artgl").RenderRange | undefined) {
    throw new Error("Method not implemented.");
  }
  
  foreachVertex(visitor: (face: import("../math").Vector3) => , range?: import("../artgl").RenderRange | undefined) {
    throw new Error("Method not implemented.");
  }


}