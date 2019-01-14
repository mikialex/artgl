import { SceneNode } from "./scene-node";
import { RenderObject } from "../core/render-object";
import { Light } from "../core/light";
import { Camera } from "../core/camera";
import { Nullable } from "../type";
import { RenderSource } from "../engine/render-engine";
import { RenderList } from "../engine/render-list";
import { Mesh } from "../object/mesh";

/**
 * scene data management
 * contains full scene tree, and other scene data
 * also responsible for list structure cache for performance
 * @export
 * @class Scene
 */
export class Scene implements RenderSource {
  root: SceneNode = new SceneNode();
  

  objectList: RenderList = new RenderList();
  // mark scene structure changed between frame render
  isFrameStructureChange: boolean = true;
  onRemoveList: Set<SceneNode> = new Set();
  onAddList: Set<SceneNode> = new Set();

  addNode(object: SceneNode) {
    this.onRemoveList.delete(object);
    this.onAddList.add(object);
  }

  removeNode(object: SceneNode) {
    this.onAddList.delete(object);
    this.onRemoveList.add(object);
  }
  
  getRenderList() {
    if (this.isFrameStructureChange) {
      this.updateObjectList();
    }
    return this.objectList;
  }

  updateObjectList() { 
    // TODO optimize
    this.objectList.reset();
    this.onRemoveList.clear();
    this.onAddList.clear();
    this.root.traverse((node) => {
      node.scene = this;
      if (node instanceof Mesh) {
        this.objectList.addRenderItem(node);
      }
    });

  }

  updateWorldMatrix() {
    this.root.updateWorldMatrix(true);
  }

  setRootNode(node: SceneNode) {
    if (!node.scene) {
      throw 'node has set to scene, abort';
    }
    this.root = node;
    this.isFrameStructureChange = true;
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

}