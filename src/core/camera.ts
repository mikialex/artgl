import { SceneNode } from "../scene/scene-node";
import { Matrix4, Vector3 } from "../math/index";
import { RenderEngine, Size } from '../engine/render-engine';
import { Observer } from './observable';
import { Nullable } from '../type';

/**
 * Camera is abstraction of a params set to a projection matrix.
 * extender can support more useful interface
 * to make the projection relation more easy to 
 * understand and modified;
 */
export abstract class Camera extends SceneNode {

  abstract updateProjectionMatrix(): void;
  abstract onRenderResize(newSize: Size): void;

  projectionChanged() {
    this._projectionMatrixNeedUpdate = true;
    this._viewProjectionMatrixNeedUpdate = true;
    
  }

  private renderSizeObserver: Nullable<Observer<Size>> = null;
  bindEngineRenderSize(engine: RenderEngine) {
    if (this.renderSizeObserver !== null) {
      engine.resizeObservable.remove(this.renderSizeObserver);
    }
    this.renderSizeObserver = engine.resizeObservable.add(this.onRenderResize);
  }

  _projectionMatrix = new Matrix4();
  _projectionMatrixNeedUpdate = true;
  
  get projectionMatrix(): Readonly<Matrix4> {
    if (this._projectionMatrixNeedUpdate) {
      this.updateProjectionMatrix();
      this._projectionMatrixNeedUpdate = false;
    }
    return this._projectionMatrix
  }

  
  _worldMatrixInverse = new Matrix4();
  _worldMatrixInverseNeedUpdate = true;

  get worldMatrixInverse(): Readonly<Matrix4> {
    if (this._worldMatrixInverseNeedUpdate) {
      this.worldMatrix.getInverse(this._worldMatrixInverse, false);
      this._worldMatrixInverseNeedUpdate = false;
    }
    return this._worldMatrixInverse;
  }

  _viewProjectionMatrix = new Matrix4();
  _viewProjectionMatrixNeedUpdate = true;

  get viewProjectionMatrix(): Readonly<Matrix4> {
    if (this._viewProjectionMatrixNeedUpdate) {
      this._viewProjectionMatrix.multiplyMatrices(this.projectionMatrix, this.worldMatrixInverse);
      this._viewProjectionMatrixNeedUpdate = false;
    }
    return this._viewProjectionMatrix;
  }

  _worldPosition = new Vector3();
  _worldPositionNeedUpdate = true;
  get worldPosition(): Readonly<Vector3> {
    if (this._worldPositionNeedUpdate) {
      this.worldMatrix.getPosition(this._worldPosition)
      this._worldPositionNeedUpdate = false;
    }
    return this._worldPosition;
  }

  private jitterPMatrix = new Matrix4();
  private jitterVPMatrix = new Matrix4();
  getJitteredViewProjectionMatrix(width: number, height: number): Readonly<Matrix4> {
    this.jitterPMatrix.copy(this.projectionMatrix);
    this.jitterPMatrix.elements[8] += ((2 * Math.random() - 1) / width);
    this.jitterPMatrix.elements[9] += ((2 * Math.random() - 1) / height);
    this.jitterVPMatrix.multiplyMatrices(this.jitterPMatrix, this.worldMatrixInverse);
    return this.jitterPMatrix
  }

}

export function ProjectionMatrixNeedUpdate<T extends Camera>() {
  return (camera: T, key: keyof T) => {
    let val = camera[key];
    const getter = () => {
      return val;
    };
    const setter = (value: any) => {
      const oldValue = val;
      val = value;
      if (oldValue !== value) {
        camera.projectionChanged();
      }
    };

    Object.defineProperty(camera, key, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true,
    });
  };
}
