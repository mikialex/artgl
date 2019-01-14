import { Vector3, Matrix4, Quaternion, generateUUID } from "../math/index";
import { Scene } from "./scene";
import { Euler } from "../math/euler";
import { Nullable } from "../type";
import { Transformation } from "./transformation";

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

  parent: Nullable<SceneNode> = null;
  children: SceneNode[] = [];

  transform: Transformation = new Transformation();
  worldMatrix = new Matrix4();

  addChild(node: SceneNode) {
    if (node === this) {
      throw 'cant add self to self';
    }
    this.scene.isFrameStructureChange = true;
    node.parent.removeChild(node);
    node.parent = this;
    this.children.push(node);
  }

  removeChild(node: SceneNode) {
    this.scene.isFrameStructureChange = true;
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