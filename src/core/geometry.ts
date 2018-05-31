import { Vector3, TriangleFace } from "../math";

export class Geometry {
  constructor() {
    
  }
  vertices: Array<Vector3> = [];
  colors: Array<Vector3> = [];
  faces: Array<TriangleFace> = [];

  // vertices: Float32Array
  // colors

  createTestVertices() {
    return new Float32Array([
      1, 1,0,
      -1, -1,0,
      1, 0.5,0,
    ])
  }

  createTestVerticesColors() {
    return new Float32Array([
      0.5, 0.2, 0.1,
      0.1, 0.1,1,
      1, 0.5,1,
    ])
  }

  createVerticesBuffer() {
    let tempVertices: Array<number> = [];
    this.vertices.forEach(vertex => {
      tempVertices.push(vertex.x);
      tempVertices.push(vertex.y);
      tempVertices.push(vertex.z);
    })
    return new Float32Array(tempVertices);
  }

  dispose() {
    
  }
}

