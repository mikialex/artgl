import { BufferData } from "./buffer-data";
import { AttributeUsage } from "../webgl/attribute";

interface LayoutInfo{
  usage: AttributeUsage,
  stride: number,
}

// layout is specify this geomeotry's data usage info
export interface GeometryDataLayout {
  dataInfo: { [index: string]: LayoutInfo };
  indexDraw?: boolean;
  drawFrom: number;
  drawCount: number;
}

/**
 * geometry define what to draw
 * by defined data layout and data content
 * also handle gl buffer updatation
 * @export
 * @class Geometry
 */
export class Geometry {
  constructor() {
  }
  bufferDatas: { [index: string]: BufferData } = {};
  layout: GeometryDataLayout;
  needUpdate: boolean = true;
  parameters: any;

  /**
   * creat or update the geometry's data in bufferdatas
   * 
   * @memberof Geometry
   */
  populate() {
    throw 'geometry not implemented'
  }

  dispose() {

  }

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
  index: {
    usage: AttributeUsage.index,
    stride: 1
  },
}

