import { Vector3, Matrix4, Quaternion } from "../math/index";
import { Scene } from "./scene";
import { Euler } from "../math/euler";
import { Nullable } from "../type";

/**
 * a scene node in a scene tree
 * organize the scene hierachy
 *
 * @export
 * @class SceneNode
 */
export class SceneNode {
  scene: Nullable<Scene> = null;

  parent: Nullable<SceneNode> = null;
  children: SceneNode[] = [];

  position = new Vector3(0, 0, 0);
  rotation = new Euler();
  quaternion = new Quaternion();
  scale = new Vector3(1, 1, 1);
  matrix = new Matrix4();
  worldMatrix = new Matrix4();
  isTransformDirty = true;

  updateLocalMatrix() {
    this.matrix.compose(this.position, this.quaternion, this.scale);
  }

  addChild(node: SceneNode) {
    if (node === this) {
      throw 'cant add self to self';
    }
    node.parent = this;
    this.children.push(node);
  }

  removeChild(node: SceneNode) {
    let index = this.children.indexOf(node);
    if (index !== - 1) {
      node.parent = null;
      this.children.splice(index, 1);
    }
  }

  traverse(fn: (sceneNode: SceneNode) => any) {
    function visit(node: SceneNode) {
      fn(node);
      for (let i = 0; i < node.children.length; i++) {
        visit(node.children[i]);
      }
    }
    visit(this);
  }

  updateWorldMatrix(force?: boolean): void {
    if (this.isTransformDirty || force) {

      if (this.parent === null) {
        this.worldMatrix.copy(this.matrix);
      } else {
        this.worldMatrix.multiplyMatrices(this.parent.worldMatrix, this.matrix);
      }
      this.isTransformDirty = false;
      force = true;
    }
    var children = this.children;
    for (var i = 0, l = children.length; i < l; i++) {
      children[i].updateWorldMatrix(force);
    }
  }


}