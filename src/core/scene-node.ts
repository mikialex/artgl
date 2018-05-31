import { Vector3 } from "../math/math";

export class SceneNode {
  position = new Vector3(0, 0, 0);
  // rotation = new Quaternion();
  scale = new Vector3(1, 1, 1);

  parent: SceneNode = null;
  children: Array<SceneNode> = [];

  // objToWorldMatrix: Matrix

  // updateObjToWorldMatrix() {
  //   this.objToWorldMatrix = Matrix.Compose(this.scale, this.rotation, this.position);
  // }

  addChild(obj: SceneNode) {
    obj.parent = this;
    this.children.push(obj);
  }

  removeChildren(obj: SceneNode) {
    let index = this.children.indexOf(obj);
    if (index !== - 1) {
      obj.parent = null;
      this.children.splice(index, 1);
    }
  }
}