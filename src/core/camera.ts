import { SceneNode } from "../scene/scene-node";
import { Matrix4 } from "../math/index";

/**
 * camera is abstration of a MVP matrix.
 * extender can support more usefull interface
 * to make the projection relation more easy to 
 * understand and modified;
 * 
 * @export
 * @class Camera
 * @extends {SceneNode}
 */
export class Camera extends SceneNode{
  constructor() {
    super();
  }

  projectionMatrix = new Matrix4();
  updateProjectionMatrix() {
    
  }

}