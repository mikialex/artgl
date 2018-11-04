import { Vector3, Matrix4, Quaternion} from "../math";
import { Scene } from "./scene";

export class SceneNode {
  scene: Scene;

  parent: SceneNode = null;
  children: SceneNode[] = [];

  property: {};

  position = new Vector3(0, 0, 0);
  rotation = new Quaternion();
  scale = new Vector3(1, 1, 1);
  matrix = new Matrix4();
  worldMatrix = new Matrix4();
  isTransfromDirty = true;

  updateLocalMatrix() {
      this.matrix.compose(this.scale, this.rotation, this.position);
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
    fn(this);
    for (let i = 0; i < this.children.length; i++) {
      fn(this.children[i]);
    }
  }
}