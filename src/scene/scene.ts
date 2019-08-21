import { SceneNode } from "./scene-node";
import { RenderObject } from "../core/render-object";
import { RenderSource } from "../engine/render-source";
import { RenderList } from "../engine/render-list";

/**
 * scene data management
 * contains full scene tree, and other scene data
 * also responsible for list structure cache for performance
 * @export
 * @class Scene
 */
export class Scene implements RenderSource {
  root: SceneNode = new SceneNode();
  

  private objectList: RenderList = new RenderList();

  updateSource() {
    this.updateObjectList();
  }

  resetSource() {
    this.objectList.resetCursor();
  }

  nextRenderable() {
    return this.objectList.next();
  }

  updateObjectList() { 
    this.objectList.reset();
    this.root.traverse((node) => {
      node.scene = this;

      // TODO optimize 
      if (node.parent !== null) {
        node._worldMatrix.multiplyMatrices(node.parent._worldMatrix, node.transform.matrix);
      } else {
        node._worldMatrix.copy(node.transform.matrix);
      }

      if (node instanceof RenderObject) {
        this.objectList.addRenderItem(node);
      }
    });

  }

  updateWorldMatrix() {
    this.root.updateWorldMatrix(true);
  }

  setRootNode(node: SceneNode) {
    if (node.scene) {
      throw 'node has set to scene, abort';
    }
    this.root = node;
  }

  disposeRootNode() {
    if (!this.root) {
      throw 'scene hasn\'t root';
    }
    this.root.traverse((node) => {
      node.scene = null;
    });
    this.root = null;
  }

}