import { Geometry } from "../core/geometry";
import { AttributeUsage } from "../webgl/attribute";


const TestGeometryConfig = {
  attributeList: [{
    usage: AttributeUsage.position,
    stride: 3
  }]
}

export class TestGeometry extends Geometry {
  constructor() {
    super(TestGeometryConfig);
    this.populate();
  }

  populate() {
    this.attributes.position.setData(new Float32Array(
      [
        -1.0, -1.0, -1.0, // triangle 1 : begin
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0, // triangle 1 : end
        1.0, 1.0, -1.0, // triangle 2 : begin
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0, // triangle 2 : end
        1.0, -1.0, 1.0,
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,
        -1.0, -1.0, -1.0,
        -1.0, 1.0, 1.0,
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,
        1.0, -1.0, 1.0
      ]
    ))
    // this.attributes.position.setData(new Float32Array(
    //   [0, 0, 0,
    //     1, 0, 0,
    //     1, 1, 0]
    // ))
    this.drawCount = 36;
  }

}
