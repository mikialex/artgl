import { RenderObject, PrimitiveVisitor, PrimitiveType } from "../core/render-object";
import { DrawMode } from "../webgl/const";
import { RayCasterable } from "../core/raycaster";
export class Mesh extends RenderObject
  implements RayCasterable
{
  raycasterable: true = true;

  constructor() {
    super();

    this.drawType = DrawMode.TRIANGLES;
    this.primitiveType = PrimitiveType.triangle;
  }

  foreachPrimitive(visitor: PrimitiveVisitor) {
    if (this.geometry !== undefined) {
      this.geometry.foreachFace(visitor, this.range)
    }
  }

  raycastHit(): boolean {
    throw new Error("Method not implemented.");
  }
  
  raycast(): import("../core/raycaster").RayCastResult {
    throw new Error("Method not implemented.");
  }

}