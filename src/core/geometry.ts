import { Vector3 } from "../math/vector3";

export class Geometry {
  constructor() {
    
  }
  vertices: Array<Vector3> = [];
  colors: Array<Vector3> = [];
  faces: Array<Vector3> = [];

  createTestVertices() {
    return new Float32Array([
      1, 1,
      -1, -1,
      1,0.5
    ])
  }


}

