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

const localTransformArrayStride = 12;
const localPositionArrayStride = 3;
const worldTransformArrayStride = 12;
const worldAABBArrayStride = 6;
const worldBSphereArrayStride = 4;

class CompactScene{
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

class CompactSceneNode{
  constructor(scene: CompactScene) {
    this.scene = scene;
  }

  setIndex(id:number) {
    this.nodeId = id;
  }

  scene: CompactScene;
  positionXIndex: number;
  positionYIndex: number;
  positionZIndex: number;

  nodeId: number = null;
  parentId: number = null;
  firstChildId: number = null;
  preBrotherId: number = null;
  nextBrotherId: number = null;

  indexedchildren: number[];

  get parent(): CompactSceneNode {
    return this.scene.nodes[this.parentId];
  }

  foreachChildren(visitor: Function) {
    
  }

  add() {
    
  }

  remove() {
    
  }

  set positionX(x: number) {
    this.scene.localPositionArray[this.positionXIndex] = x;
  }

  set positionY(y: number) {
    this.scene.localPositionArray[this.positionYIndex] = y;
  }

  set positionZ(z: number) {
    this.scene.localPositionArray[this.positionZIndex] = z;
  }

  get PositionX() {
    return this.scene.localPositionArray[this.positionXIndex]
  }

  get PositionY() {
    return this.scene.localPositionArray[this.positionYIndex]
  }

  get PositionZ() {
    return this.scene.localPositionArray[this.positionZIndex]
  }

}