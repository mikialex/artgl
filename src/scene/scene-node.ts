import { Vector3, Matrix4, Quaternion, generateUUID } from "../math/index";
import { Scene } from "./scene";
import { Euler } from "../math/euler";
import { Nullable } from "../type";
import { Transformation } from "./transformation";

interface TreeNode{
  children: TreeNode[];
}

/**
 * a scene node in a scene tree
 * organize the scene hierachy
 *
 * @export
 * @class SceneNode
 */
export class SceneNode {
  uuid = generateUUID();
  scene: Nullable<Scene> = null;
  sceneNodeListIndex: number = -1;

  parent: Nullable<SceneNode> = null;
  children: SceneNode[] = [];

  transform: Transformation = new Transformation();
  _worldMatrix = new Matrix4();
  _worldMatrixUpdateFrameId: number = 0;
  get worldMatrix() {
    return this._worldMatrix;
  }

  _visible: boolean = true;
  _visibleNet: Boolean = true;
  _visibleUpdateFrameId: number = 0;
  set visible(value: boolean) {
    if (this.scene !== null) {
      this.scene.isFrameVisibleChange = true;
    }
  };
  get visible() {
    return this._visible;
  }

  addChild(node: SceneNode) {
    if (node === this) {
      throw 'cant add self to self';
    }

    if (this.scene !== null) {
      this.scene.isFrameStructureChange = true;
      this.scene.addNode(node);
    }

    if (node.parent !== null) {
      node.parent.removeChild(node);
    }
    node.parent = this;
    this.children.push(node);
  }

  removeChild(node: SceneNode) {
    if (this.scene !== null) {
      this.scene.isFrameStructureChange = true;
      this.scene.removeNode(node);
    }

    let index = this.children.indexOf(node);
    if (index !== - 1) {
      node.parent = null;
      this.children.splice(index, 1);
    }
  }

  traverse(fn: (sceneNode: SceneNode) => any) {
    function visit(node: SceneNode) {
      if (fn(node) !== false) {
        for (let i = 0; i < node.children.length; i++) {
          visit(node.children[i]);
        }
      }
    }
    visit(this);
  }

  traversePair(fn: (sceneNodeParent: Nullable<SceneNode>, sceneNode: SceneNode) => any): any {
    function visit(nodeParent: Nullable<SceneNode>, node: SceneNode) {
      const result = fn(nodeParent, node);
      for (let i = 0; i < node.children.length; i++) {
        visit(node, node.children[i]);
      }
      return result;
    }
    return visit(this.parent, this);
  }

  map(fn: (sceneNode: SceneNode) => TreeNode) {
    const nodes: Map<SceneNode, TreeNode> = new Map();
    const rootNode = this.traversePair((nodeParent: Nullable<SceneNode>, node: SceneNode) => {
      const mapNode = fn(node);
      nodes.set(node, mapNode);
      if (node.parent !== null && nodes.has(node.parent)) {
        const mapParentNode = nodes.get(node.parent);
        if (mapParentNode === undefined) {
          throw 'tree map error: cant find mapped parent'
        }
        mapParentNode.children.push(mapNode);
      }
      return mapNode;
    })
    return rootNode;
  }

  findSubNode(id: string): Nullable<SceneNode> {
    let result: Nullable<SceneNode> = null;
    this.traverse(node => {
      if (node.uuid === id) {
        result = node;
        return false;
      }
    })
    return result;
  }

  updateWorldMatrix(force?: boolean): void {
    if (this.transform.transformFrameChanged || force) {

      if (this.parent === null) {
        this.worldMatrix.copy(this.transform.matrix);
      } else {
        this.worldMatrix.multiplyMatrices(this.parent.worldMatrix, this.transform.matrix);
      }
      this.transform.transformFrameChanged = false;
      force = true;
    }
    var children = this.children;
    for (var i = 0, l = children.length; i < l; i++) {
      children[i].updateWorldMatrix(force);
    }
  }


}