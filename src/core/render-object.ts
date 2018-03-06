import { Vector3 } from "../math/vector3";
import { Matrix4 } from "../math/matrix4";
import { Matrix3 } from "../math/matrix3";

export class RenderObject {
  position = new Vector3()
  // rotation = new Euler();
  // quaternion = new Quaternion();
  scale = new Vector3(1, 1, 1);
  modelViewMatrix = new Matrix4();
  normalMatrix = new Matrix3();

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