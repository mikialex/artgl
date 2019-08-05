import {
  Transformation, BufferData, CubeGeometry, Shading,
  PureShading,
  Mesh
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

  const transformAttributeName = "transformInstance";

  const cubeG = new CubeGeometry()
    .setBuffer(transformAttributeName, transformBuffer);

  const shading = new Shading();
  shading.decorate(new PureShading());

  const mesh = new Mesh().g(cubeG).s(shading);

  
}

