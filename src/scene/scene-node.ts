import { Vector3 } from "../math";
import { RenderObject } from "../core/render-object";
import { Scene } from "./scene";

export class SceneNode {
  constructor(scene) {
    this.scene = scene;
  }
  scene: Scene;
  position = new Vector3(0, 0, 0);
  // rotation = new Quaternion();
  scale = new Vector3(1, 1, 1);

  parent: SceneNode = null;
  children: SceneNode[] = [];

  object: RenderObject;
  property: {};

  // objToWorldMatrix: Matrix

  // updateObjToWorldMatrix() {
  //   this.objToWorldMatrix = Matrix.Compose(this.scale, this.rotation, this.position);
  // }

  addChild(obj: SceneNode) {
    obj.parent = this;
    this.children.push(obj);
  }

  removeChild(obj: SceneNode) {
    let index = this.children.indexOf(obj);
    if (index !== - 1) {
      obj.parent = null;
      this.children.splice(index, 1);
    }
  }
}