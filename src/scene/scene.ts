import { SceneNode } from "./scene-node";
import { RenderObject } from "../core/render-object";
import { Light } from "../core/light";
import { Camera } from "../core/camera";

export class Scene {
  root: SceneNode
  
  objectList: RenderObject[];
  lightList: Light[];
  cameras: Camera[];

  flattenList: number[];
  flattenTreeToList() {
    
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
      node.scene = undefined;
    });
    this.objectList = [];
    this.lightList = [];
    this.root = undefined;
  }

  private addObject(object: RenderObject) {
    this.objectList.push(object);
  }

  private removeObject(node: SceneNode) {

  }
}