import { SceneNode } from "../scene/scene-node";
import { Matrix4 } from "../math/index";

export class Camera extends SceneNode{
  constructor() {
    super();
  }

  projectionMatrix = new Matrix4();
  updateProjectionMatrix() {
    
  }

}