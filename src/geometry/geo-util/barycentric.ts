import { StandardGeometry } from "../standard-geometry";
import { CommonAttribute } from "../../webgl/attribute";
import { BufferData } from "../../artgl";
import { expandStandardGeometryToNoneReusedFaceData } from "./expand";

// https://segmentfault.com/a/1190000016175828
export function generateBarycentricBuffer(position: Float32Array, index: Uint16Array) {
  const barycentricBuffer = new Float32Array(position.length);
  for (let i = 0; i < index.length / 3; i++) {
    const id = i * 3;
    const p1 = index[id] * 3;
    const p2 = index[id + 1] * 3;
    const p3 = index[id + 2] * 3;

    barycentricBuffer[p1] = 1
    barycentricBuffer[p1 + 1] = 0
    barycentricBuffer[p1 + 2] = 0
    
    barycentricBuffer[p2] = 0
    barycentricBuffer[p2 + 1] = 1
    barycentricBuffer[p2 + 2] = 0
    
    barycentricBuffer[p3] = 0
    barycentricBuffer[p3 + 1] = 0
    barycentricBuffer[p3 + 2] = 1
  }

  return barycentricBuffer;
}

export function createBarycentricBufferForStandardGeometry(geometry: StandardGeometry) {
  expandStandardGeometryToNoneReusedFaceData(geometry);
  const buffer = generateBarycentricBuffer(
    geometry.position.data as Float32Array,
    geometry.indexBuffer.data as Uint16Array
  )

  geometry.setBuffer(CommonAttribute.baryCentric, new BufferData(buffer, 3))
  return geometry;
}