import { RenderObject, PrimitiveVisitor, PrimitiveType } from "../core/render-object";
import { DrawMode, CullSide } from "../webgl/const";
import { RayCasterable, Raycaster, RayCastResult } from "../core/raycaster";
import { Face3 } from "../math/entity/face3";
import { Vector3 } from "../math/vector3";
export class Mesh extends RenderObject
  implements RayCasterable {

  constructor() {
    super();

    this.drawMode = DrawMode.TRIANGLES;
    this.primitiveType = PrimitiveType.triangle;
  }

  foreachPrimitive(visitor: PrimitiveVisitor) {
    if (this.geometry !== undefined) {
      this.geometry.foreachFace(visitor, this.range)
    }
  }

  raycast(raycaster: Raycaster, results: RayCastResult[]) {
    const localRay = raycaster.getLocalRay(this.worldMatrix);
    const hitPosition = new Vector3();

    this.geometry.foreachFace((face: Face3) => {

      const result = localRay.intersectTriangle(
        face.p1, face.p2, face.p3,
        this.state.cullSide === CullSide.CullFaceBack,
        hitPosition)

      if (result !== null) {
        results.push({
          object: this,
          hitLocalPosition: hitPosition.clone()
        })
      }

    }, this.range)
  }

  raycastIfHit(raycaster: Raycaster): boolean {
    throw new Error("Method not implemented.");
  }

  raycastFirst(raycaster: Raycaster): RayCastResult {
    throw new Error("Method not implemented.");
  }
  
  raycasterable: true = true;
}