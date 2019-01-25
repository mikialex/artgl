import { SceneNode } from "../scene/scene-node";
import { Matrix4 } from "../math/index";
import { ARTEngine, Size } from '../engine/render-engine';
import { Observer } from './observable';
import { Nullable } from '../type';

/**
 * camera is abstration of a params set to a projection matrix.
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
  projectionMatrixNeedUpdate = false;
  updateProjectionMatrix() { };
  onRenderResize(newSize: Size) {
    
  }

  private renderSizeObserver: Nullable<Observer<Size>> = null;
  bindEngineRenderSize(engine: ARTEngine) {
    if (this.renderSizeObserver !== null) {
      engine.resizeObservable.remove(this.renderSizeObserver);
    }
    this.renderSizeObserver = engine.resizeObservable.add(this.onRenderResize);
  }
  

}