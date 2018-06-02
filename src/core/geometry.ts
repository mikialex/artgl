import { Vector3, TriangleFace } from "../math";
import { Attribute, AttributeType } from "./attribute";

type GeometryParameterValueType = 'number' | 'boolean'

interface GeometryParameterDescriptor{
  name: string;
  type: GeometryParameterValueType;
}

interface GeometryConfig{
  name: string;
  parameters: GeometryParameterDescriptor[];

}

export class GeometryFactory {

  createGeometry(config: GeometryConfig) {
    // return function () {
    //   this.type = 'BoxBufferGeometry';
    // }
  }
}


export class Geometry {
  constructor() {
  }
  position: Attribute;
  normal: Attribute;
  uv: Attribute;

  needUpdate: boolean = true;
  parameters: any;

  /**
   * creat or update the geometry's data
   * 
   * @memberof Geometry
   */
  populate() {
    this.position = new Attribute(AttributeType.float32, 3, 0);
    this.normal = new Attribute(AttributeType.float32, 3, 0);
    this.uv = new Attribute(AttributeType.float32, 3, 0);
    this.needUpdate = false;
  }

  dispose() {
    
  }
}

