import {
  Transformation, BufferData, CubeGeometry, Shading,
  PureShading
} from "../../src/artgl";
import { TestBridge } from "./test-bridge";


const transform = new Transformation();
function createInstanceTransformBuffer() {
  const arraySize = 5;
  const grid = 3;

  const itemSize = 16;
  const transformArray: number[] = new Array(
    itemSize * arraySize * arraySize * arraySize
  );

  let count = 0;
  for (let i = 0; i < arraySize; i++) {
    for (let j = 0; j < arraySize; j++) {
      for (let k = 0; k < arraySize; k++) {
        transform.position.set(i * grid, j * grid, k * grid);
        transform.matrix.toArray(transformArray, count * itemSize)
        count++;
      }
    }
  }
  return new Float32Array(transformArray);
}

export default async function test(testBridge: TestBridge) {
  const transformBuffer = new BufferData(createInstanceTransformBuffer(), 16);

  const cubeG = new CubeGeometry();
  const transformAttributeName ="transformInstance"
  cubeG.bufferDatum[transformAttributeName] = transformBuffer;

  const shading = new Shading();
  shading.decorate(new PureShading());

  
}

