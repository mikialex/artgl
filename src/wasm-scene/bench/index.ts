import * as wasm from "../pkg/wasm_scene";

import {memory} from '../pkg/wasm_scene_bg'

console.log(wasm)
console.log(memory)

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

