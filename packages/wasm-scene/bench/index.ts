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
        // child.positionX = Math.random();
        // child.rotationX = Math.random();
        // child.scaleZ = Math.random();
        count++;
        node.add(child);
        addChildren(child, d - 1);
      }
    }
  }
  addChildren(scene.rootNode, depth);
  console.log(`${count} has add to scene`)
}

import * as THREE from './node_modules/three/src/Three' // i have no idea
function buildTHREEScene(scene: THREE.Scene, childrenCount: number, depth: number) {
  let count = 0;
  function addChildren(node: THREE.Object3D, d: number) {
    if (d > 0) {
      for (let i = 0; i < childrenCount; i++) {
        const child = new THREE.Object3D()
        child.matrixAutoUpdate = false;
        // child.position.x = Math.random();
        // child.rotation.y = Math.random();
        // child.scale.z= Math.random();
        count++;
        node.add(child);
        addChildren(child, d - 1);
      }
    }
  }
  addChildren(scene, depth);
  console.log(`${count} has add to scene (object 3d)`)
}

console.log(wasm)
console.log(memory)

const scene = new CompactScene();
console.log(scene)

buildScene(scene, 6, 6);

function output(result: number[]) {
  let sum = 0;
  result.forEach(re => {
    sum += re;
  })
  console.log(result)
  console.log("avg:" + sum / result.length);
}

console.log("wasm");
let wasmresult = []
for (let i = 0; i < 50; i++) {
  let t = performance.now();
  scene.batchDrawcall();
  t = performance.now() - t;
  wasmresult.push(t);
}
wasmresult = wasmresult.slice(3);
output(wasmresult)

const scenethree = new THREE.Scene();
scenethree.matrixAutoUpdate = false;
buildTHREEScene(scenethree, 6, 6);

console.log("three");
let threeresult = []
for (let i = 0; i < 50; i++) {
  let t = performance.now();
  scenethree.updateWorldMatrix(true, true);
  t = performance.now() - t;
  threeresult.push(t);
}
threeresult = threeresult.slice(3);
output(threeresult)


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

