import { 
  RayCastSource, Geometry, Material, Shading, RenderObject,
  NormalShading, RayCasterable, RenderEngine, RenderSource
} from "@artgl/core";
import { SceneNode } from "./scene-node";
import { RenderList } from "./render-list";
import { Background, SolidColorBackground } from "./background";
import { RefCountMap } from "./ref-count-map";

/**
 * scene data management
 * contains full scene tree, and other scene data
 * also responsible for list structure cache for performance
 * @export
 * @class Scene
 */
export class Scene implements RenderSource, RayCastSource {
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
  selectShading: Shading = new Shading().decorate(new NormalShading());

  background: Background = new SolidColorBackground();

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

  visitAllRenderObject(visitor: (item: RenderObject) => any) {
    this.updateObjectList();
    this.renderList.forEach(item => {
      visitor(item);
    })
  }

  foreachRaycasterable(visitor: (obj: RayCasterable) => boolean): void {
    this.updateObjectList();
    this.renderList.forEach(item => {
      if ((item as unknown as RayCasterable).raycasterable === true) {
        visitor(item as unknown as RayCasterable);
      }
    })
  }

  render = (engine: RenderEngine) => {
    this.background.render(engine);
    this.renderScene(engine);
  }

  renderScene = (engine: RenderEngine) => {
    this.visitAllRenderObject((item) => {
      engine.render(item);
    })
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
    // todo check if not need update
    this.renderList.reset();
    this.root.traverse((node) => {
      node.scene = this;

      // TODO optimize 
      if (node.parent !== null) {
        node.worldMatrix.multiplyMatrices(node.parent.worldMatrix, node.transform.matrix);
      } else {
        node.worldMatrix.copy(node.transform.matrix);
      }

      if (!node.visible) {
        return false;
      }

      if (node instanceof RenderObject) {
        this.renderList.addRenderItem(node as RenderObject); //todo
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