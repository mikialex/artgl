import { StandardGeometry } from "../standard-geometry";

export function expandStandardGeometryToNoneReusedFaceData(
  geometry: StandardGeometry
) {
  const newPosition = [];
  const newNormal = [];
  const newUv = [];
  const newIndex = [];

  const position = geometry.position.data;
  const normal = geometry.normal.data;
  const uv = geometry.uv.data;
  const index = geometry.indexBuffer.data;
  for (let i = 0; i < index.length / 3; i++) {
    const id = i * 3;
    const p1 = index[id] * 3;
    const p2 = index[id + 1] * 3;
    const p3 = index[id + 2] * 3;

    newPosition.push(position[p1], position[p1 + 1], position[p1 + 2]);
    newNormal.push(normal[p1], normal[p1 + 1], normal[p1 + 2]);
    newUv.push(uv[p1], uv[p1 + 1], uv[p1 + 2]);

    newPosition.push(position[p2], position[p2 + 1], position[p2 + 2]);
    newNormal.push(normal[p2], normal[p2 + 1], normal[p2 + 2]);
    newUv.push(uv[p2], uv[p2 + 1], uv[p2 + 2]);
    
    newPosition.push(position[p3], position[p3 + 1], position[p3 + 2]);
    newNormal.push(normal[p3], normal[p3 + 1], normal[p3 + 2]);
    newUv.push(uv[p3], uv[p3 + 1], uv[p3 + 2]);

    newIndex.push(newIndex.length, newIndex.length + 1, newIndex.length + 2);
  }

  geometry.create(newIndex, newPosition, newNormal, newUv);

  return geometry;

}