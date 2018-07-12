import { SceneNode } from "../scene/scene-node";
import { Matrix4 } from "../math";

export class Camera{
  constructor() {
    
  }

  projectionMatrix = new Matrix4();
  updateProjectionMatrix() {
    
  }

  nodeRef: SceneNode;
}