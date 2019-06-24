import { CompactSceneNode } from "./wasm-scene-node";
import { ArrayScene } from "../pkg/wasm_scene";
import * as wasmScene from "../pkg/wasm_scene_bg";

export const transformArrayStride = 12;
export const positionArrayStride = 3;
export const rotationArrayStride = 3;
export const scaleArrayStride = 3;

export const AABBArrayStride = 6;
export const BSphereArrayStride = 4;

export const nodeIndexStride = 4;

export class CompactScene {
  static defaultCompactSceneCapacity = 1000;
  constructor() {
    this.wasmScene = ArrayScene.new();
    this.checkIfNeedAndReAllocate(this.capacity);
    const root = this.createSceneNode();
    root.hasAttached = true;
  }

  destroy() {
    this.wasmScene.free();
  }

  wasmScene: ArrayScene;

  // each data is indexed for a sceneNode;
  localPositionArray: Float32Array;
  localRotationArray: Float32Array;
  localScaleArray: Float32Array;

  localTransformArray: Float32Array;
  worldTransformArray: Float32Array;

  localAABBArray: Float32Array;
  worldAABBArray: Float32Array;

  localBSphereArray: Float32Array;
  worldBSphereArray: Float32Array;

  sortKeyArray: Uint32Array;

  emptyArray: Uint8Array;
  emptyListArray: Uint16Array;
  emptyCount: number;

  nodesIndexs: Int16Array;
  nodes: CompactSceneNode[] = [];

  capacity: number = CompactScene.defaultCompactSceneCapacity;
  nodeCount: number = 0;
  get rootNode() {
    return this.nodes[0];
  }

  private checkIfNeedAndReAllocate(newCapacity: number) {
    const alloctionInfo = this.wasmScene.allocate(newCapacity);
    console.log("wasm reallocated:", alloctionInfo);
    const wasmMemoryBuffer = wasmScene.memory.buffer;

    this.localPositionArray =
      new Float32Array(wasmMemoryBuffer,
        alloctionInfo.local_position_array_start,
        newCapacity * positionArrayStride);


    this.localRotationArray =
      new Float32Array(wasmMemoryBuffer,
        alloctionInfo.local_rotation_array_start,
        newCapacity * rotationArrayStride);


    this.localScaleArray =
      new Float32Array(wasmMemoryBuffer,
        alloctionInfo.local_scale_array_start,
        newCapacity * scaleArrayStride);

    this.localTransformArray =
      new Float32Array(wasmMemoryBuffer,
        alloctionInfo.local_transform_array_start,
        newCapacity * transformArrayStride);

    this.worldTransformArray =
      new Float32Array(wasmMemoryBuffer,
        alloctionInfo.world_transform_array_start,
        newCapacity * transformArrayStride);

    this.localAABBArray =
      new Float32Array(wasmMemoryBuffer,
        alloctionInfo.local_aabb_array_start,
        newCapacity * AABBArrayStride);
    this.worldAABBArray =
      new Float32Array(wasmMemoryBuffer,
        alloctionInfo.world_aabb_array_start,
        newCapacity * AABBArrayStride);

    this.localBSphereArray =
      new Float32Array(wasmMemoryBuffer,
        alloctionInfo.local_bsphere_array_start,
        newCapacity * BSphereArrayStride);
    this.worldBSphereArray =
      new Float32Array(wasmMemoryBuffer,
        alloctionInfo.world_bsphere_array_start,
        newCapacity * BSphereArrayStride);

    this.nodesIndexs =
      new Int16Array(wasmMemoryBuffer,
        alloctionInfo.nodes_indexs_start,
        newCapacity * nodeIndexStride);

  }

  private findAvaliableNodeIndex(): number {
    if (this.nodeCount < this.capacity) {
      let ret = this.nodeCount;
      this.nodeCount++;
      return ret;
    } else {
      if (this.emptyCount > 0) {

      } else {
        this.checkIfNeedAndReAllocate(this.capacity * 1.8);
        return this.findAvaliableNodeIndex();
      }
    }
  }

  createSceneNode(): CompactSceneNode {
    const node = new CompactSceneNode(this);
    const index = this.findAvaliableNodeIndex();
    node.setIndex(index);

    node.nextBrotherId = -1;
    node.preBrotherId = -1;
    node.parentId = -1;
    node.firstChildId = -1;

    node.positionX = 0;
    node.positionY = 0;
    node.positionZ = 0;
    node.rotationX = 0;
    node.rotationY = 0;
    node.rotationZ = 0;
    node.scaleX = 1;
    node.scaleY = 1;
    node.scaleZ = 1;

    this.nodes[index] = node;
    return node;
  }

  private markNodeDeletion(node: CompactSceneNode) {
    this.emptyArray[node.nodeId] = 1;
  }

  deleteSceneNode(node: CompactSceneNode) {
    this.markNodeDeletion(node);
    this.nodeCount--;
  }

  batchDrawcall() {
    this.wasmScene.batch_renderlist();
  }
}

function setBit() {

}

// MSB [ 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000 ] LSB
//       ^ ^       ^  ^                                   ^^                 ^
//       | |       |  |                                   ||                 |- 3 bits - Shader System (Pass Immediate)
//       | |       |  |                                   ||- 16 bits - Depth
//       | |       |  |                                   |- 1 bit - Instance bit
//       | |       |  |- 32 bits - User defined
//       | |       |- 3 bits - Shader System (Pass Deferred)
//       | - 7 bits - Layer System
//       |- 2 bits - Unused
// 


// transform * 12, bboxminx, bboxminy, bboxminz, bboxmaxx, bboxmaxy, bboxmaxz, centerx, centery, centerz, bsphereR,
// vertexcount, facecount
