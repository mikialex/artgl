import { StandardGeometry } from "../standard-geometry";
import { Vector3, Matrix4 } from "@artgl/math";

const temp = new Vector3();
export function transformStandardGeometry
  (geo: StandardGeometry, matrix: Matrix4): StandardGeometry {
  const position = geo.position.data

  for (let i = 0; i < position.length / 3; i++) {
    const index = i * 3;
    temp.set(position[index], position[index + 1], position[index + 2]);
    temp.applyMatrix4(matrix);
    position[index] = temp.x;
    position[index + 1] = temp.y;
    position[index + 2] = temp.z;
  }
  
  return geo;
}