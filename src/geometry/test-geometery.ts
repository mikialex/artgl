import { Geometry } from "../core/geometry";
import { Attribute, AttributeType } from "../core/attribute";

export class TestGeometry extends Geometry {
  constructor() {
    super(); 
  }

  populate() {
    this.position.setData(new Float32Array(
      [0, 0, 0,
        1, 0, 0,
      1,1,0]
    ))
  }

}
