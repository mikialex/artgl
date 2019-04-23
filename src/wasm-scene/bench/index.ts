import * as wasm from "../pkg/wasm_scene";

import {memory} from '../pkg/wasm_scene_bg'
import { CompactScene } from "../client/wasm-scene";

console.log(wasm)
console.log(memory)

const scene = new CompactScene();
console.log(scene)

const node1 = scene.createSceneNode();

console.log(node1)

const node2 = scene.createSceneNode();
console.log(node2)

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

