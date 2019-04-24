import { CompactScene, positionArrayStride, nodeIndexStride, rotationArrayStride, scaleArrayStride } from "./wasm-scene";

type SceneNodeVisitor = (node: CompactSceneNode) => any;
type SceneNodeVisitorEarlyExit = (node: CompactSceneNode) => boolean;


export class CompactSceneNode{
  constructor(scene: CompactScene) {
    this.scene = scene;
  }

  setIndex(id:number) {
    this.nodeId = id;

    this._positionXIndex = this.nodeId * positionArrayStride;
    this._positionYIndex = this.nodeId * positionArrayStride + 1;
    this._positionZIndex = this.nodeId * positionArrayStride + 2;

    this._rotationXIndex = this.nodeId * rotationArrayStride;
    this._rotationYIndex = this.nodeId * rotationArrayStride + 1;
    this._rotationZIndex = this.nodeId * rotationArrayStride + 2;

    this._scaleXIndex = this.nodeId * scaleArrayStride;
    this._scaleYIndex = this.nodeId * scaleArrayStride + 1;
    this._scaleZIndex = this.nodeId * scaleArrayStride + 2;

    this._parentIdIndex = this.nodeId * nodeIndexStride
    this._preBrotherIdIndex = this.nodeId * nodeIndexStride + 1;
    this._nextBrotherIdIndex = this.nodeId * nodeIndexStride + 2;
    this._firstIdIndex = this.nodeId * nodeIndexStride + 3;
  }

  scene: CompactScene;

  // cache for optimize 
  _positionXIndex: number;
  _positionYIndex: number;
  _positionZIndex: number;
  _rotationXIndex: number;
  _rotationYIndex: number;
  _rotationZIndex: number;
  _scaleXIndex: number;
  _scaleYIndex: number;
  _scaleZIndex: number;

  _parentIdIndex: number;
  _firstIdIndex: number;
  _preBrotherIdIndex: number;
  _nextBrotherIdIndex: number;

  nodeId: number = null;

  hasAttached: boolean = false;

  indexedchildren: number[];

  get parent(): CompactSceneNode {
    return this.scene.nodes[this.parentId];
  }

  foreachChildren(visitor: SceneNodeVisitor) {
    if (this.firstChildId === -1) {
      return;
    }
    let nextId = this.firstChildId;
    while (nextId !== -1) {
      const next = this.scene.nodes[nextId];
      visitor(next);
      nextId = next.nextBrotherId
    }
  }

  traverse(visitor: SceneNodeVisitor) {
    var tra = (node: CompactSceneNode) => {
      visitor(node);
      node.foreachChildren(child => {
        tra(child)
      })
    }
    tra(this);
  }

  add(node: CompactSceneNode) {
    if (node.hasAttached) {
      throw "node should remove from scene before add to other"
    }
    if (node === this) {
      throw "cant add self"
    }
    const oldFirstChild = this.scene.nodes[this.firstChildId];
    if (oldFirstChild !== undefined) {
      oldFirstChild.preBrotherId = node.nodeId;
      node.nextBrotherId = oldFirstChild.nodeId;
    }
    node.parentId = this.nodeId;
    this.firstChildId = node.nodeId;
    if (this.hasAttached) {
      node.traverse(n => {
        n.hasAttached = true;
      })
    }
  }

  remove(nodeToRemove: CompactSceneNode) {

    // reconnect dlink list
    const preBrother = this.scene.nodes[this.preBrotherId];
    const nextBrother = this.scene.nodes[this.nextBrotherId];
    preBrother.nextBrotherId = nextBrother.nodeId;
    nextBrother.preBrotherId = preBrother.nodeId;

    nodeToRemove.preBrotherId = -1;
    nodeToRemove.nextBrotherId = -1;
    if (this.hasAttached) {
      nodeToRemove.traverse(node => {
        node.hasAttached = false;
      })
    }
  }

  findInChildren(node: CompactSceneNode): number {
    if (this.firstChildId === -1) {
      return;
    }
    let id = 0;
    let nextId = this.firstChildId;
    while (nextId !== -1) {
      const next = this.scene.nodes[nextId];
      if (next === node) {
        return id;
      }
      nextId = next.nextBrotherId;
      id++;
    }
  }
    
  set parentId(id:number) {
    this.scene.nodesIndexs[this._parentIdIndex] = id;
  }
  get parentId() {
    return this.scene.nodesIndexs[this._parentIdIndex];
  }

  set firstChildId(id:number) {
    this.scene.nodesIndexs[this._firstIdIndex] = id;
  }
  get firstChildId() {
    return this.scene.nodesIndexs[this._firstIdIndex];
  }

  set preBrotherId(id:number) {
    this.scene.nodesIndexs[this._preBrotherIdIndex] = id;
  }
  get preBrotherId() {
    return this.scene.nodesIndexs[this._preBrotherIdIndex];
  }

  set nextBrotherId(id:number) {
    this.scene.nodesIndexs[this._nextBrotherIdIndex] = id;
  }
  get nextBrotherId() {
    return this.scene.nodesIndexs[this._nextBrotherIdIndex];
  }

  set positionX(x: number) {
    this.scene.localPositionArray[this._positionXIndex] = x;
  }

  set positionY(y: number) {
    this.scene.localPositionArray[this._positionYIndex] = y;
  }

  set positionZ(z: number) {
    this.scene.localPositionArray[this._positionZIndex] = z;
  }

  get positionX() {
    return this.scene.localPositionArray[this._positionXIndex]
  }

  get positionY() {
    return this.scene.localPositionArray[this._positionYIndex]
  }

  get positionZ() {
    return this.scene.localPositionArray[this._positionZIndex]
  }

  set rotationX(x: number) {
    this.scene.localRotationArray[this._rotationXIndex] = x;
  }

  set rotationY(y: number) {
    this.scene.localRotationArray[this._rotationYIndex] = y;
  }

  set rotationZ(z: number) {
    this.scene.localRotationArray[this._rotationZIndex] = z;
  }

  get rotationX() {
    return this.scene.localRotationArray[this._rotationXIndex]
  }

  get rotationY() {
    return this.scene.localRotationArray[this._rotationYIndex]
  }

  get rotationZ() {
    return this.scene.localRotationArray[this._rotationZIndex]
  }


  set scaleX(x: number) {
    this.scene.localScaleArray[this._scaleXIndex] = x;
  }

  set scaleY(y: number) {
    this.scene.localScaleArray[this._scaleYIndex] = y;
  }

  set scaleZ(z: number) {
    this.scene.localScaleArray[this._scaleZIndex] = z;
  }

  get scaleX() {
    return this.scene.localScaleArray[this._scaleXIndex]
  }

  get scaleY() {
    return this.scene.localScaleArray[this._scaleYIndex]
  }

  get scaleZ() {
    return this.scene.localScaleArray[this._scaleZIndex]
  }

}