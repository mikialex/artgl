import { StandardGeometry } from "../standard-geometry";
import { BufferData } from "../../core/buffer-data";

export function makeStandardGeometryWireFrame(g: StandardGeometry) {
  const newIndexBuffer: number[] = [];
  g.foreachFace((_f, index1, index2, index3) => {
    newIndexBuffer.push(index1)
    newIndexBuffer.push(index2)
    newIndexBuffer.push(index2)
    newIndexBuffer.push(index3)
    newIndexBuffer.push(index3)
    newIndexBuffer.push(index1)
  })
  g.indexBuffer = new BufferData(new Uint32Array(newIndexBuffer), 1)
  return g;
}