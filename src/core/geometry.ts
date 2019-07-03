import { BufferData } from "./buffer-data";
import { Box3 } from "../math/entity/box3";
import { Sphere } from "../math/entity/sphere";
import { generateUUID } from '../math/uuid';
import { RenderRange, PrimitiveVisitor } from "./render-object";
import { Face3 } from "../math/entity/face3";
import { Line3 } from "../math/entity/line3";
import { Vector3 } from "../math/vector3";

/**
 * geometry define what to draw
 * by defined data layout and data content
 * also handle gl buffer updatation
 * @export
 * @class Geometry
 */
export abstract class Geometry {
  constructor() {
  }
  name: string
  uuid = generateUUID();
  readonly bufferDatas: { [index: string]: BufferData } = {};
  indexBuffer: BufferData;
  get needUpdate(): boolean{
    for (const key in this.bufferDatas) {
      if (this.bufferDatas[key].shouldUpdate) {
        return true
      }
    }
    return false;
  }

  _AABBBox: Box3 = new Box3();
  abstract updateAABBBox(): void;
  get AABBBox(): Box3 {
    if (this.needUpdate) {
      this.updateAABBBox();
    }
    return this._AABBBox;
  }

  _boundingShere: Sphere = new Sphere();
  abstract updateBoundingShere(): void;
  get boundingShere(): Sphere {
    if (this.needUpdate) {
      this.updateBoundingShere();
    }
    return this._boundingShere;
  }

  /**
   * creat or update the geometry's data in bufferdatas
   */
  abstract populate(): void;

  abstract foreachFace(visitor: (face: Face3) => any, range?: RenderRange): any;
  abstract foreachLineSegment(visitor:  (face: Line3) => any, range?: RenderRange): any;
  abstract foreachVertex(visitor:  (face: Vector3) => any, range?: RenderRange): any;

  dispose() {

  }

}


