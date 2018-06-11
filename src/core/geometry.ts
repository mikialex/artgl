import { Vector3, TriangleFace } from "../math";
import { Attribute, AttributeType, AttributeUsage } from "./attribute";

type GeometryParameterValueType = 'number' | 'boolean'


export const StandradAttributeConfig = [
  {
    usage: AttributeUsage.position,
    stride: 3
  },
  {
    usage: AttributeUsage.normal,
    stride: 3
  },
  {
    usage: AttributeUsage.color,
    stride: 3
  },
  {
    usage: AttributeUsage.uv,
    stride: 2
  },
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
    this.attributesConfig.attributeList.forEach(attConf => {
      switch (attConf.usage) {
        case AttributeUsage.position:
          this.attributes.position = new Attribute(AttributeType.float, attConf.stride, 0);
          break;

        case AttributeUsage.normal:
          this.attributes.normal = new Attribute(AttributeType.float, attConf.stride, 0);
          break;
        
        case AttributeUsage.color:
          this.attributes.color = new Attribute(AttributeType.float, attConf.stride, 0);
          break;
        
        case AttributeUsage.uv:
          this.attributes.uv = new Attribute(AttributeType.float, attConf.stride, 0);
          break;

        default:
          break;
      }
    })
  }
  attributesConfig: GeometryConfig;
  attributes: any = {};
  drawFrom = 0;
  drawCount = 0;

  needUpdate: boolean = true;
  parameters: any;

  /**
   * creat or update the geometry's data
   * 
   * @memberof Geometry
   */
  populate() {

  }

  dispose() {

  }


}

