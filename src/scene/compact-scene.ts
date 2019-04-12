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

  // each data is indexed for a sceneNode;
  localTransformArray: Float32Array;
  localPositionArray: Float32Array;
  worldTransformArray: Float32Array;
  worldAABBArray: Float32Array;
  worldBSphereArray: Float32Array;

  sortKeyArray: Uint32Array;

  emptyArray: Uint8Array;
  
  batchDrawcall() {
    
  }
}

class CompactSceneNode{
  constructor(scene: CompactScene) {
    this.scene = scene;
  }
  scene: CompactScene;
  nodeId: number;
  positionXIndex: number;
  positionYIndex: number;
  positionZIndex: number;

  indexedchildren: number[];

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