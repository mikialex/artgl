
import { RenderSource } from "../engine/render-source";
import { RenderList } from "../engine/render-list";
import { Geometry } from "../core/geometry";
import { Material } from "../core/material";
import { Shading } from "../core/shading";
import { SceneNode, RenderObject } from "../artgl";

/**
 * scene data management
 * contains full scene tree, and other scene data
 * also responsible for list structure cache for performance
 * @export
 * @class Scene
 */
export class Scene implements RenderSource {
  constructor() {
    this.root.scene = this;
  }
  root: SceneNode = new SceneNode();

  private objectList: RenderList = new RenderList();
  _geometries: Set<Geometry> = new Set();
  _materials: Set<Material> = new Set();
  _shadings: Set<Shading> = new Set();

  updateSource() {
    this.updateObjectList();
  }

  resetSource() {
    this.objectList.resetCursor();
  }

  nextRenderable() {
    return this.objectList.next();
  }

  addRenderable(node: RenderObject) {
    if (node.geometry !== undefined) {
      this._geometries.add(node.geometry);
    }
    if (node.material !== undefined) {
      this._materials.add(node.material);
    }
    if (node.shading !== undefined) {
      this._shadings.add(node.shading);
    }
  }

  removeRenderable(node: RenderObject) {
    if (node.geometry !== undefined) {
      this._geometries.delete(node.geometry);
    }
    if (node.material !== undefined) {
      this._materials.delete(node.material);
    }
    if (node.shading !== undefined) {
      this._shadings.delete(node.shading);
    }
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

      if (!node.visible) {
        return false;
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
    this.root = new SceneNode();
  }

}