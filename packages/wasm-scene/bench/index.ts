import * as wasm from "../pkg/wasm_scene";

import {memory} from '../pkg/wasm_scene_bg'
import { CompactScene } from "../client/wasm-scene";
import { CompactSceneNode } from "../client/wasm-scene-node";

function buildScene(scene: CompactScene, childrenCount: number, depth: number) {
  let count = 0;
  function addChildren(node: CompactSceneNode, d: number) {
    if (d > 0) {
      for (let i = 0; i < childrenCount; i++) {
        const child = scene.createSceneNode();
        count++;
        node.add(child);
        addChildren(child, d - 1);
      }
    }
  }
  addChildren(scene.rootNode, depth);
  console.log(`${count} has add to scene`)
}

console.log(wasm)
console.log(memory)

const scene = new CompactScene();
console.log(scene)

buildScene(scene, 5, 2);

scene.batchDrawcall();

// wasm.greet("hello from js to wasm");

// const dataLength = 1000000;
// const batcher = wasm.Batcher.new();
// console.log(batcher)
// const ptr = batcher.allocate(dataLength);
// const dataview = new Float32Array(memory.buffer, ptr, dataLength);

// for (let i = 0; i < dataLength; i++) {
//     dataview[i] = i;
// }

// batcher.batch(5);

