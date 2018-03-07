import { Vector3, Quaternion, Matrix } from "../math/math";

export class RenderObject {
  position = new Vector3(0, 0, 0);
  rotation = new Quaternion();
  scale = new Vector3(1, 1, 1);

  parent: RenderObject = null;
  children: Array<RenderObject> = [];

  objToWorldMatrix: Matrix

  updateObjToWorldMatrix() {
    this.objToWorldMatrix = Matrix.Compose(this.scale, this.rotation, this.position);
  }

  addChild(obj: RenderObject) {
    obj.parent = this;
    this.children.push(obj);
  }

  removeChildren(obj: RenderObject) {
    let index = this.children.indexOf(obj);
    if (index !== - 1) {
      obj.parent = null;
      this.children.splice(index, 1);
    }
  }
}