import { RenderObject, PrimitiveVisitor, PrimitiveType } from "../core/render-object";
import { DrawMode } from "../webgl/const";
import { RayCasterable, Raycaster } from "../core/raycaster";
export class Mesh extends RenderObject
  implements RayCasterable
{

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


  raycast(raycaster: Raycaster, results: RayCasterable[]) {
    throw new Error("Method not implemented.");
  }
  raycastIfHit(raycaster: Raycaster): boolean {
    throw new Error("Method not implemented.");
  }
  raycastFirst(raycaster: Raycaster): import("../core/raycaster").RayCastResult {
    throw new Error("Method not implemented.");
  }
  raycasterable: true = true;
}