import { Vector3, Matrix4 } from "../math";
import { RenderObject } from "../core/render-object";
import { Scene } from "./scene";
import { Camera } from "../core/camera";
import { Light } from "../core/light";

export class SceneNode {
  constructor(scene) {
    this.scene = scene;
  }
  scene: Scene;
  // position = new Vector3(0, 0, 0);
  // rotation = new Quaternion();
  // scale = new Vector3(1, 1, 1);

  parent: SceneNode = null;
  children: SceneNode[] = [];

  object: RenderObject;
  light: Light;
  camera: Camera;
  property: {};

  isMatrixNeedUpdate = false;
  matrix = new Matrix4();

  // objToWorldMatrix: Matrix

  // updateObjToWorldMatrix() {
  //   this.objToWorldMatrix = Matrix.Compose(this.scale, this.rotation, this.position);
  // }

  addChild(node: SceneNode) {
    // if()
    // this.scene.addEntity(obj);
    node.parent = this;
    this.children.push(node);
  }

  removeChild(node: SceneNode) {
    // this.scene.removeEntity(obj);
    let index = this.children.indexOf(node);
    if (index !== - 1) {
      node.parent = null;
      this.children.splice(index, 1);
    }
  }
}