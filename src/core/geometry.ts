import { GLDataType } from "../webgl/shader-util";
import { BufferData } from "./buffer-data";
import { AttributeUsage } from "../webgl/attribute";

// export const MeshAttributeConfig = [
//   { usage: AttributeUsage.position, stride: 3 },
//   { usage: AttributeUsage.normal, stride: 3 },
//   { usage: AttributeUsage.color, stride: 3 },
//   { usage: AttributeUsage.uv, stride: 2 },
// ]


interface lauoutInfo{
  usage: AttributeUsage,
  stride: number,
  drawFrom: number;
  drawCount: number;
}

export interface GeometryDataLayout {
  [index: string]: lauoutInfo;
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

function generateAttributes(attributesConfig, attributes) {
  attributesConfig.attributeList.forEach(attConf => {
    switch (attConf.usage) {
      case AttributeUsage.position:
        attributes.position = new Attribute(GLDataType.float, attConf.stride, 0);
        break;

      case AttributeUsage.normal:
        attributes.normal = new Attribute(GLDataType.float, attConf.stride, 0);
        break;

      case AttributeUsage.color:
        attributes.color = new Attribute(GLDataType.float, attConf.stride, 0);
        break;

      case AttributeUsage.uv:
        attributes.uv = new Attribute(GLDataType.float, attConf.stride, 0);
        break;

      default:
        break;
    }
  })
}


