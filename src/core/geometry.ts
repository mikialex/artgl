import { BufferData } from "./buffer-data";
import { AttributeUsage } from "../webgl/attribute";
import { Box3 } from "../math/entity/box3";
import { Sphere } from "../math/entity/sphere";
import { generateUUID } from '../math/uuid';
import { RenderRange, PrimitiveVisitor } from "./render-object";

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
   * 
   * @memberof Geometry
   */
  abstract populate(): void;

  abstract foreachPrimitive(visitor: PrimitiveVisitor, range: RenderRange): any;

  dispose() {

  }

}


