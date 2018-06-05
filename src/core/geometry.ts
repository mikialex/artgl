import { Vector3, TriangleFace } from "../math";
import { Attribute, AttributeType, AttributeUsage } from "./attribute";

type GeometryParameterValueType = 'number' | 'boolean'

// interface GeometryParameterDescriptor{
//   name: string;
//   type: GeometryParameterValueType;
// }

// interface GeometryConfig{
//   name: string;
//   parameters: GeometryParameterDescriptor[];

// }

// export class GeometryFactory {

//   createGeometry(config: GeometryConfig) {
//     // return function () {
//     //   this.type = 'BoxBufferGeometry';
//     // }
//   }
// }

export interface AttributesConfig{
  attributeList: { usage: AttributeUsage}[]
}

export class Geometry {
  constructor(conf: AttributesConfig) {
    this.attributesConfig = conf;
    this.attributesConfig.attributeList.forEach(attConf => {
      switch (attConf.usage) {
        case AttributeUsage.position:
          this.attributes.position = new Attribute(AttributeType.float32, 3, 0);
          break;

        case AttributeUsage.normal:
          this.attributes.normal = new Attribute(AttributeType.float32, 3, 0);
          break;
        
        case AttributeUsage.uv:
          this.attributes.uv = new Attribute(AttributeType.float32, 3, 0);
          break;

        default:
          break;
      }
    })
  }
  attributesConfig: AttributesConfig
  attributes:any = {};

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

