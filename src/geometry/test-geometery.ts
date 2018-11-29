import { Geometry } from "../core/geometry";
import { AttributeUsage } from "../webgl/attribute";
import { Float32BufferData } from "../core/buffer-data";
import { generateNormalFromPostion } from "../util/normal-generation";

export class TestGeometry extends Geometry {
  constructor() {
    super();
    this.layout = {
      dataInfo: {
        position: {
          usage: AttributeUsage.position,
          stride: 3
        },
        normal: {
          usage: AttributeUsage.normal,
          stride: 3
        }
      },
      drawFrom: 0,
      drawCount: 36,
    }
    this.populate();
  }

  populate() {
    const positionBuffer = new Float32Array([
      -1.0,-1.0,-1.0, // triangle 1 : begin
      -1.0, 1.0, 1.0, // triangle 1 : end
      -1.0,-1.0, 1.0,

      1.0, 1.0,-1.0, // triangle 2 : begin
      -1.0, 1.0,-1.0, // triangle 2 : end
      -1.0,-1.0,-1.0,

      1.0,-1.0, 1.0,
      1.0,-1.0,-1.0,
      -1.0,-1.0,-1.0,

      1.0, 1.0,-1.0,
      -1.0,-1.0,-1.0,
      1.0,-1.0,-1.0,

      -1.0,-1.0,-1.0,
      -1.0, 1.0,-1.0,
      -1.0, 1.0, 1.0,

      1.0,-1.0, 1.0,
      -1.0,-1.0,-1.0,
      -1.0,-1.0, 1.0,

      -1.0, 1.0, 1.0,
      1.0,-1.0, 1.0,
      -1.0,-1.0, 1.0,

      1.0, 1.0, 1.0,
      1.0, 1.0,-1.0,
      1.0,-1.0,-1.0,

      1.0,-1.0,-1.0,
      1.0,-1.0, 1.0,
      1.0, 1.0, 1.0,

      1.0, 1.0, 1.0,
      -1.0, 1.0,-1.0,
      1.0, 1.0,-1.0,

      1.0, 1.0, 1.0,
      -1.0, 1.0, 1.0,
      -1.0, 1.0,-1.0,

      1.0,-1.0, 1.0,
      -1.0, 1.0, 1.0,
      1.0, 1.0, 1.0,
    ])
    
    const position = new Float32BufferData(positionBuffer);
    this.bufferDatas.position = position;

    const normal = new Float32BufferData(generateNormalFromPostion(position.data as Float32Array));
    this.bufferDatas.normal = normal;
  }

}
