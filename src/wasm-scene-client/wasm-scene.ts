import { CompactSceneNode } from "./wasm-scene-node";

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

export const localTransformArrayStride = 12;
export const localPositionArrayStride = 3;
export const worldTransformArrayStride = 12;
export const worldAABBArrayStride = 6;
export const worldBSphereArrayStride = 4;

export const nodeIndexStride = 4;

export class CompactScene{
  static defaultCompactSceneCapacity = 1000;
  constructor() {
    this.checkIfNeedAndReAllocate(this.capacity);
  }

  // each data is indexed for a sceneNode;
  localTransformArray: Float32Array;
  localPositionArray: Float32Array;
  worldTransformArray: Float32Array;
  worldAABBArray: Float32Array;
  worldBSphereArray: Float32Array;

  sortKeyArray: Uint32Array;

  emptyArray: Uint8Array;
  emptyListArray: Uint16Array;
  emptyCount: number;

  nodesIndexs: Uint16Array;
  nodes: CompactSceneNode[];

  capacity: number = CompactScene.defaultCompactSceneCapacity;
  nodeCount: number = 0;

  private checkIfNeedAndReAllocate(newCapacity:number) {
    
  }

  private findAvaliableNodeIndex(): number{
    if (this.nodeCount < this.capacity) {
      this.nodeCount++;
      return this.nodeCount;
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
    this.nodeCount++;
    return node;
  }

  private markNodeDeleteion(node: CompactSceneNode) {
    this.emptyArray[node.nodeId] = 1;
  }

  deleteSceneNode(node: CompactSceneNode) {
    this.markNodeDeleteion(node);
    this.nodeCount--;
  }
  
  batchDrawcall() {
    
  }
}
