import { Vector3, TriangleFace } from "../math";
import { Attribute, AttributeType, AttributeUsage } from "./attribute";

type GeometryParameterValueType = 'number' | 'boolean'


export const MeshAttributeConfig = [
  { usage: AttributeUsage.position, stride: 3 },
  { usage: AttributeUsage.normal, stride: 3 },
  { usage: AttributeUsage.color, stride: 3 },
  { usage: AttributeUsage.uv, stride: 2 },
]


export interface AttributeListItem{
  usage: AttributeUsage,
  stride: number
}


export interface GeometryConfig{
  attributeList: AttributeListItem[]
}

export class Geometry {
  constructor(conf: GeometryConfig) {
    this.attributesConfig = conf;
    generateAttributes(conf, this.attributes);
  }
  attributesConfig: GeometryConfig;
  attributes: any = {};
  drawFrom = 0;
  drawCount = 0;

  needUpdate: boolean = true;
  parameters: any;

  /**
   * creat or update the geometry's data in attributes
   * 
   * @memberof Geometry
   */
  populate() {

  }



  dispose() {

  }


}

function generateAttributes(attributesConfig, attributes) { 
  attributesConfig.attributeList.forEach(attConf => {
    switch (attConf.usage) {
      case AttributeUsage.position:
        attributes.position = new Attribute(AttributeType.float, attConf.stride, 0);
        break;

      case AttributeUsage.normal:
        attributes.normal = new Attribute(AttributeType.float, attConf.stride, 0);
        break;

      case AttributeUsage.color:
        attributes.color = new Attribute(AttributeType.float, attConf.stride, 0);
        break;

      case AttributeUsage.uv:
        attributes.uv = new Attribute(AttributeType.float, attConf.stride, 0);
        break;

      default:
        break;
    }
  })
}


