import { SceneNode } from "./scene-node";
import { RenderObject } from "../core/render-object";
import { Light } from "../core/light";
import { Camera } from "../core/camera";
import { Nullable } from "../type";
import { RenderSource } from "../engine/render-engine";
import { RenderList } from "../engine/render-list";

/**
 * scene data management
 * contains full scene tree, and other scene data
 * also responsible for list structure cache for performance
 * @export
 * @class Scene
 */
export class Scene implements RenderSource {
  root: Nullable<SceneNode> = null;
  
  objectList: RenderList = new RenderList();
  cameras: Camera[] = [];

  isFrameStructureChange: boolean = true;

  getRenderList() {
    return this.objectList;
  }

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
    this.root = null;
  }

  private addObject(object: RenderObject) {
    this.objectList.addRenderItem(object);
  }

  private removeObject(node: SceneNode) {

  }
}