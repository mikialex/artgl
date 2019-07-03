import { Geometry } from "../core/geometry";
import { RenderRange } from "../core/render-object";
import { Face3 } from "../math/entity/face3";
import { Line3 } from "../math/entity/line3";
import { Vector3 } from "../math/vector3";

const tempFace3 = new Face3();
const tempLine3 = new Line3();
const tempVector3 = new Vector3();
export class StandardGeometry extends Geometry {
  constructor() {
    super();
  }

  updateBoundingSphere() {
    const sphere = this._boundingSphere;
    const box = this.AABBBox; // update box
    const center = box.getCenter(sphere.center);
    let maxRadiusSq = 0;
    this.foreachVertex((point) => {
      maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(point));
    })
    sphere.radius = maxRadiusSq;
  }
  
  updateAABBBox() { 
    const box = this._AABBBox;
    box.makeEmpty();
    this.foreachVertex((point) => {
      box.expandByPoint(point);
    })
  }

  foreachFace(visitor: (face: Face3) => any, range?: RenderRange) {
    const position = this.bufferDatum.position;
    const start = (range === undefined ? 0 : range.start) / 3;
    const end = (range === undefined ? position.count:(range.start + range.count)) / 3;
    for (let i = start; i < end; i++) {
      const p1Index = i * 3;
      const p2Index = i * 3 + 1;
      const p3Index = i * 3 + 2;
      tempFace3.p1.set(position.getIndex(p1Index), position.getIndex(p1Index+ 1), position.getIndex(p1Index + 2));
      tempFace3.p2.set(position.getIndex(p2Index), position.getIndex(p2Index+ 1), position.getIndex(p2Index + 2));
      tempFace3.p3.set(position.getIndex(p3Index), position.getIndex(p3Index+ 1), position.getIndex(p3Index + 2));
      visitor(tempFace3);
    }
  };

  /**
   * this may redundant visit a lot
   */
  foreachLineSegment(visitor: (line: Line3) => any, range?: RenderRange) {
    const position = this.bufferDatum.position;
    const start = (range === undefined ? 0 : range.start) / 3;
    const end = (range === undefined ? position.count:(range.start + range.count)) / 3;
    for (let i = start; i < end; i++) {
      const p1Index = i * 3;
      const p2Index = i * 3 + 1;
      const p3Index = i * 3 + 2;
      tempFace3.p1.set(position.getIndex(p1Index), position.getIndex(p1Index+ 1), position.getIndex(p1Index + 2));
      tempFace3.p2.set(position.getIndex(p2Index), position.getIndex(p2Index+ 1), position.getIndex(p2Index + 2));
      tempFace3.p3.set(position.getIndex(p3Index), position.getIndex(p3Index + 1), position.getIndex(p3Index + 2));

      tempLine3.p1.copy(tempFace3.p1)
      tempLine3.p2.copy(tempFace3.p2)
      visitor(tempLine3);
      tempLine3.p2.copy(tempFace3.p3)
      visitor(tempLine3);
      tempLine3.p1.copy(tempFace3.p2)
      visitor(tempLine3);
    }
  };

  foreachVertex(visitor: (point: Vector3) => any, range?: RenderRange) {
    const position = this.bufferDatum.position;
    const start = range === undefined ? 0 : range.start;
    const end = range === undefined ? position.count:(range.start + range.count);
    for (let i = start; i < end; i++) {
      tempVector3.set(position.getIndex(i), position.getIndex(i + 1), position.getIndex(i + 2));
      visitor(tempVector3);
    }
  };

  populate() {
    throw 'generate methods not impl'
  }
}