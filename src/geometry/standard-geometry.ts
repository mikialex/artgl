import { Geometry } from "../core/geometry";
import { RenderRange } from "../core/render-object";
import { Face3 } from "../math/entity/face3";
import { Line3 } from "../math/entity/line3";
import { Vector3 } from "../math/vector3";
import { BufferData } from "../core/buffer-data";
import { CommonAttribute } from "../webgl/attribute";

const tempFace3 = new Face3();
const tempLine3 = new Line3();
const tempVector3 = new Vector3();

/**
 * StandardGeometry is indexed Geometry that has position uv normal channel
 */
export class StandardGeometry extends Geometry {
  constructor() {
    super();
  }

  static create(index: number[], position: number[], normal: number[], uv: number[]): StandardGeometry {
    return new StandardGeometry().create(index, position, normal, uv)
  }

  create(index: number[], position: number[], normal: number[], uv: number[]): StandardGeometry {
    const positionBuffer = BufferData.f3(position);
    this.setBuffer(CommonAttribute.position, positionBuffer);

    const normalBuffer = BufferData.f3(normal);
    this.setBuffer(CommonAttribute.normal, normalBuffer);

    const uvBuffer = BufferData.f2(uv);
    this.setBuffer(CommonAttribute.uv, uvBuffer);

    // TODO distinguish u16 case
    const indexBuffer = BufferData.u32Index(index);
    this.indexBuffer = indexBuffer;

    return this;
  }

  updateBoundingSphere() {
    const sphere = this._boundingSphere;
    const box = this.AABBBox; // update box
    const center = box.getCenter(sphere.center);
    let maxRadiusSq = 0;
    this.foreachVertex((point) => {
      maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(point));
    })
    sphere.radius = Math.sqrt(maxRadiusSq);
  }

  updateAABBBox() {
    const box = this._AABBBox;
    box.makeEmpty();
    this.foreachVertex((point) => {
      box.expandByPoint(point);
    })
  }

  foreachFace(visitor: (face: Face3) => any, range?: RenderRange) {
    const position = this.getBuffer(CommonAttribute.position);
    const index = this.indexBuffer;
    const start = range === undefined ? 0 : range.start;
    const end = range === undefined ? index.count : (range.start + range.count);
    for (let i = start; i < end; i++) {
      const p1Index = index.getIndex(i * 3, 0);
      const p2Index = index.getIndex(i * 3 + 1, 0);
      const p3Index = index.getIndex(i * 3 + 2, 0);
      tempFace3.p1.set(position.getIndex(p1Index, 0), position.getIndex(p1Index, 1), position.getIndex(p1Index, 2));
      tempFace3.p2.set(position.getIndex(p2Index, 0), position.getIndex(p2Index, 1), position.getIndex(p2Index, 2));
      tempFace3.p3.set(position.getIndex(p3Index, 0), position.getIndex(p3Index, 1), position.getIndex(p3Index, 2));
      visitor(tempFace3);
    }
  };

  /**
   * this may redundant visit 
   */
  foreachLineSegment(visitor: (line: Line3) => any, range?: RenderRange) {
    const position = this.getBuffer(CommonAttribute.position);
    const index = this.indexBuffer;
    const start = range === undefined ? 0 : range.start;
    const end = range === undefined ? index.count : (range.start + range.count);
    for (let i = start; i < end; i++) {
      const p1Index = index.getIndex(i * 3, 0);
      const p2Index = index.getIndex(i * 3 + 1, 0);
      const p3Index = index.getIndex(i * 3 + 2, 0);
      tempFace3.p1.set(position.getIndex(p1Index, 0), position.getIndex(p1Index, 1), position.getIndex(p1Index, 2));
      tempFace3.p2.set(position.getIndex(p2Index, 0), position.getIndex(p2Index, 1), position.getIndex(p2Index, 2));
      tempFace3.p3.set(position.getIndex(p3Index, 0), position.getIndex(p3Index, 1), position.getIndex(p3Index, 2));

      tempLine3.p1.copy(tempFace3.p1)
      tempLine3.p2.copy(tempFace3.p2)
      visitor(tempLine3);
      tempLine3.p2.copy(tempFace3.p3)
      visitor(tempLine3);
      tempLine3.p1.copy(tempFace3.p2)
      visitor(tempLine3);
    }
  };

  /**
   * this may redundant visit 
   */
  foreachVertex(visitor: (point: Vector3) => any, range?: RenderRange) {
    const position = this.getBuffer(CommonAttribute.position);
    const index = this.indexBuffer;
    const start = range === undefined ? 0 : range.start;
    const end = range === undefined ? index.count : (range.start + range.count);
    for (let i = start; i < end; i++) {
      const p1Index = index.getIndex(i, 0);
      tempVector3.set(position.getIndex(p1Index, 0), position.getIndex(p1Index, 1), position.getIndex(p1Index, 2));
      visitor(tempVector3);
    }
  };

  shape() {
    throw 'generate methods not impl'
  }
}