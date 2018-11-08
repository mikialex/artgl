import { BufferData } from "./buffer-data";
import { AttributeUsage } from "../webgl/attribute";

interface LayoutInfo{
  usage: AttributeUsage,
  stride: number,
}

// layout is specify this geomeotry's data usage info
export interface GeometryDataLayout {
  dataInfo: { [index: string]: LayoutInfo };
  drawFrom: number;
  drawCount: number;
}

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



