import { BufferData } from "./buffer-data";
import { AttributeUsage } from "../webgl/attribute";
import { Box3 } from "../math/entity/box3";
import { Sphere } from "../math/entity/sphere";
import { generateUUID } from '../math/uuid';

interface LayoutInfo{
  usage: AttributeUsage,
  stride: number,
}

// layout is specify this geomeotry's data usage info
export interface GeometryDataLayout {
  dataInfo: { [index: string]: LayoutInfo };
}

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
  layout: GeometryDataLayout;
  needUpdate: boolean = true;

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
    return this._boundingShere;
  }

  /**
   * creat or update the geometry's data in bufferdatas
   * 
   * @memberof Geometry
   */
  abstract populate(): void;

  dispose() {

  }

}

export const defaultNoTexGeometryLayoutDataInfo = {
  position: {
    usage: AttributeUsage.position,
    stride: 3
  },
  normal: {
    usage: AttributeUsage.normal,
    stride: 3
  },
}

export const defaultGeometryLayoutDataInfo = {
  position: {
    usage: AttributeUsage.position,
    stride: 3
  },
  normal: {
    usage: AttributeUsage.normal,
    stride: 3
  },
  uv: {
    usage: AttributeUsage.uv,
    stride: 2
  },
}

