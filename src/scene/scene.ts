import { SceneNode } from "./scene-node";
import { RenderObject } from "../core/render-object";
import { Light } from "../core/light";
import { Camera } from "../core/camera";
import { Nullable } from "../type";

/**
 * scene data management
 * contains full scene tree, and other scene data
 * also responsible for list structure cache for performance
 * @export
 * @class Scene
 */
export class Scene {
  root: Nullable<SceneNode> = null;
  
  objectList: RenderObject[] = [];
  lightList: Light[] = [];
  cameras: Camera[] = [];

  updateWorldMatrix() {
    if(this.root === null){
      return;
    }
    this.root.updateWorldMatrix(true);
  }

  setRootNode(node: SceneNode) {
    if (!node.scene) {
      throw 'node has set to scene, abort';
    }
    this.root = node;
    this.root.traverse((node) => {
      node.scene = this;
    });
  }

  disposeRootNode() {
    if (!this.root) {
      throw 'scene hasnt root';
    }
    this.root.traverse((node) => {
      node.scene = null;
    });
    this.objectList = [];
    this.lightList = [];
    this.root = null;
  }

  private addObject(object: RenderObject) {
    this.objectList.push(object);
  }

  private removeObject(node: SceneNode) {

  }
}