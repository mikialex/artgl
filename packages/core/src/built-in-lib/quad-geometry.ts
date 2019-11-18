import { Geometry } from "../core/render-entity/geometry";
import { BufferData } from "../core/render-entity/buffer-data";
import { CommonAttribute } from "@artgl/webgl";

// === PlaneGeometry(2, 2, 1, 1)
export class QuadGeometry extends Geometry{

  updateAABBBox(): void { }
  updateBoundingSphere(): void {}
  shape(): void { }
  foreachFace() { };
  foreachLineSegment() { };
  foreachVertex() { };

  constructor() {
    super();
    const positionBuffer = BufferData.f3(
      [-1, 1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0]
    );
    this.setBuffer(CommonAttribute.position, positionBuffer)

    const normalBuffer = BufferData.f3(
      [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]
    );
    this.setBuffer(CommonAttribute.normal, normalBuffer)

    const uvBuffer = BufferData.f2(
      [0, 1, 1, 1, 0, 0, 1, 0]
    );
    this.setBuffer(CommonAttribute.uv, uvBuffer)

    const index = BufferData.u32Index(
      [0, 2, 1, 2, 3, 1]
    )
    this.indexBuffer = index;
  }
}