
import { RenderSource } from "../engine/render-source";
import { RenderList } from "../engine/render-list";
import { Geometry } from "../core/geometry";
import { Material } from "../core/material";
import { Shading } from "../core/shading";
import { SceneNode, RenderObject } from "../artgl";
import { PureShading } from "../shading/basic-lib/pure";
import { RefCountMap } from "../util/ref-count-map";


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

  private renderList: RenderList = new RenderList();
  _geometries: RefCountMap<Geometry> = new RefCountMap();
  _materials: RefCountMap<Material> = new RefCountMap();
  _shadings: RefCountMap<Shading> = new RefCountMap();
  _allRenderable: Set<RenderObject> = new Set();

  selectionSet: Set<RenderObject> = new Set();
  selectShading: Shading = new Shading().decorate(new PureShading());

  clearSelect() {
    this.selectionSet.clear();
  }

  select(object: RenderObject) {
    if (this._allRenderable.has(object)) {
      this.selectionSet.add(object);
    } else {
      throw "this object is not in this scene"
    }
  }

  updateSource() {
    this.updateObjectList();
  }

  resetSource() {
    this.renderList.resetCursor();
  }

  nextRenderable(render: (object: RenderObject) => void) {
    const nextObject = this.renderList.next();
    if (nextObject === null) {
      return false;
    } else {
      // for selection highlight
      // if (this.selectionSet.has(nextObject)) {
      //   let originShading = nextObject.shading;
      //   nextObject.shading = this.selectShading;
      //   render(nextObject);
      //   nextObject.shading = originShading;
      //   return true;
      // }
      render(nextObject);
      return true;
    }
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
    this._allRenderable.add(node);
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
    this.selectionSet.delete(node);
    this._allRenderable.delete(node);
  }

  updateObjectList() {
    this.renderList.reset();
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
        this.renderList.addRenderItem(node);
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
    node.scene = this;
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