import { StandardGeometry } from "../standard-geometry";
import { Vector3 } from "../../math";

export class ArrowGeometry extends StandardGeometry {
  bottomRadius: number = 1;
  ArrowRadius: number = 2;
  ArrowHeight: number = 2;
  height: number = 3;
  segments: number = 10;

  shape() {
    const position = [];
    const normal = [];
    const uv = [];

    const arrowOrigin = new Vector3(0, 0, 0);

    for (let i = 0; i < this.segments; i++) {
      const theta = Math.PI * 2 / i;
      const edgePoint = new Vector3(
        Math.sin(theta) * this.bottomRadius,
        0,
        Math.cos(theta) * this.bottomRadius
      )
      const edgePointNormal = new Vector3(
        0, -1 ,0
      )
      position.push(edgePoint);
      normal.push(edgePointNormal);
    }

    position.push(arrowOrigin)
  }

}