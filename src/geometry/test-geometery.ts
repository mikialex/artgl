import { Geometry } from "../core/geometry";
import { AttributeUsage } from "../webgl/attribute";
import { BufferData, Float32BufferData } from "../core/buffer-data";

export class TestGeometry extends Geometry {
  constructor() {
    super();
    this.layout = {
      dataInfo: {
        position: {
          usage: AttributeUsage.position,
          stride: 3
        }
      },
      drawFrom: 0,
      drawCount: 5,
    }
    this.populate();
  }

  populate() {
    const position = new Float32BufferData(this.layout.dataInfo.position.stride * this.layout.drawCount);
    this.bufferDatas.position = position;
    position.setData(new Float32Array(
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
  }

}
