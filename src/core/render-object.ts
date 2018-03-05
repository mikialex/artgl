import { Vector3 } from "../math/vector3";

export class RenderObject {
  position = new Vector3()
  // rotation = new Euler();
  // quaternion = new Quaternion();
  scale = new Vector3(1, 1, 1);

  parent: RenderObject = null;
  children: Array<RenderObject> = [];

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