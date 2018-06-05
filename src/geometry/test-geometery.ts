import { Geometry } from "../core/geometry";
import { Attribute, AttributeType, AttributeUsage } from "../core/attribute";

const TestGeometryConfig = {
  attributeList: [{
    type: AttributeUsage.position
  }]
}

export class TestGeometry extends Geometry {
  constructor() {
    super(TestGeometryConfig); 
  }

  populate() {
    this.attributes.position.setData(new Float32Array(
      [0, 0, 0,
        1, 0, 0,
        1,1,0]
    ))
  }

}
