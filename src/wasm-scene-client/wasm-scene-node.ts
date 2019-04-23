import { CompactScene, localPositionArrayStride, nodeIndexStride } from "./wasm-scene";

type SceneNodeVisitor = (node: CompactSceneNode) => any;
type SceneNodeVisitorEarlyExit = (node: CompactSceneNode) => boolean;


export class CompactSceneNode{
  constructor(scene: CompactScene) {
    this.scene = scene;
  }

  setIndex(id:number) {
    this.nodeId = id;

    this.positionXIndex = this.nodeId * localPositionArrayStride;
    this.positionYIndex = this.nodeId * localPositionArrayStride + 1;
    this.positionZIndex = this.nodeId * localPositionArrayStride + 2;

    this.parentIdIndex = this.nodeId * nodeIndexStride
    this.firstIdIndex = this.nodeId * nodeIndexStride + 1;
    this.preBrotherIdIndex = this.nodeId * nodeIndexStride + 2;
    this.nextBrotherIdIndex = this.nodeId * nodeIndexStride + 3;
  }

  scene: CompactScene;

  // cache for optimize 
  positionXIndex: number;
  positionYIndex: number;
  positionZIndex: number;

  parentIdIndex: number;
  firstIdIndex: number;
  preBrotherIdIndex: number;
  nextBrotherIdIndex: number;

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
      this.foreachChildren(child => {
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
    oldFirstChild.preBrotherId = node.nodeId;
    node.nextBrotherId = oldFirstChild.nodeId;
    node.parentId = this.nodeId;
    this.firstChildId = node.nodeId;
    node.traverse(n => {
      n.hasAttached = true;
    })
  }

  remove(nodeToRemove: CompactSceneNode) {

    // reconnect dlink list
    const preBrother = this.scene.nodes[this.preBrotherId];
    const nextBrother = this.scene.nodes[this.nextBrotherId];
    preBrother.nextBrotherId = nextBrother.nodeId;
    nextBrother.preBrotherId = preBrother.nodeId;

    nodeToRemove.preBrotherId = -1;
    nodeToRemove.nextBrotherId = -1;
    nodeToRemove.traverse(node => {
      node.hasAttached = false;
    })
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
    this.scene.nodesIndexs[this.parentIdIndex] = id;
  }
  get parentId() {
    return this.scene.nodesIndexs[this.parentIdIndex];
  }

  set firstChildId(id:number) {
    this.scene.nodesIndexs[this.firstIdIndex] = id;
  }
  get firstChildId() {
    return this.scene.nodesIndexs[this.firstIdIndex];
  }

  set preBrotherId(id:number) {
    this.scene.nodesIndexs[this.preBrotherIdIndex] = id;
  }
  get preBrotherId() {
    return this.scene.nodesIndexs[this.preBrotherIdIndex];
  }

  set nextBrotherId(id:number) {
    this.scene.nodesIndexs[this.nextBrotherIdIndex] = id;
  }
  get nextBrotherId() {
    return this.scene.nodesIndexs[this.nextBrotherIdIndex];
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