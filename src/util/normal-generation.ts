import { Vector3 } from "../math/index";

const v1 = new Vector3();
const v2 = new Vector3();
const v3 = new Vector3();
const v12 = new Vector3();
const v13 = new Vector3();
const n = new Vector3();

export function generateNormalFromPosition(vertices: Float32Array): Float32Array {
  const vertices_length = vertices.length;
  const step = 9;
  const normals = new Float32Array(vertices_length);

  for (let i = 0; i < vertices_length; i += step) {
      v1.set(vertices[i + 0], vertices[i + 1], vertices[i + 2]);
      v2.set(vertices[i + 3], vertices[i + 4], vertices[i + 5]);
      v3.set(vertices[i + 6], vertices[i + 7], vertices[i + 8]);
      v12.copy(v2).sub(v1);
      v13.copy(v3).sub(v1);
      n.crossVectors(v13, v12);
      n.normalize();
      normals[i + 0] = n.x;
      normals[i + 1] = n.y;
      normals[i + 2] = n.z;
      normals[i + 3] = n.x;
      normals[i + 4] = n.y;
      normals[i + 5] = n.z;
      normals[i + 6] = n.x;
      normals[i + 7] = n.y;
      normals[i + 8] = n.z;
  }

  return normals;
}