import { SceneNode } from "../scene/scene-node";
import { Matrix4, Vector3 } from "../math/index";
import { RenderEngine, Size } from '../engine/render-engine';
import { Observable } from './observable';
import { ShaderUniformProvider, ShaderUniformDecorator, getPropertyUniform } from "./shading";
import { ShaderCommonUniformInputNode } from "../shader-graph/shader-node";
import { checkCreate, MapUniform } from "./shading-util";
import { ShaderGraph } from "../shader-graph/shader-graph";
import { VPTransform } from "../shader-graph/built-in/transform";
import { uniformFromValue } from "../shader-graph/node-maker";

/**
 * Camera is abstraction of a decoration of view projection matrix in a vertex graph
 * Implementor should impl how matrix is calculate and how to react to render size change
 */
export abstract class Camera extends SceneNode
  implements ShaderUniformProvider, ShaderUniformDecorator {

  static readonly WorldPositionKey = 'CameraWorldPosition'
  static readonly ProjectionMatrix = 'CameraProjectionMatrix'

  constructor() {
    super();
    this.uniforms = checkCreate((this as any).uniforms, new Map());
    this.propertyUniformNameMap = checkCreate((this as any).propertyUniformNameMap, new Map());
    this.notifyNeedRedecorate = checkCreate((this as any).notifyNeedRedecorate, new Observable());
  }

  @MapUniform('VPMatrix')
  _renderMatrix = new Matrix4();

  decorate(graph: ShaderGraph): void {
    graph.registerSharedUniform(Camera.WorldPositionKey, this.getPropertyUniform('_worldPosition'))
    graph.registerSharedUniform(Camera.ProjectionMatrix, this.getPropertyUniform('_renderMatrix'))
    graph.registerSharedUniform(SceneNode.WorldMatrixKey, uniformFromValue(SceneNode.WorldMatrixKey, this.worldMatrix))
    graph.setVertexRoot(
      VPTransform.make()
        .input("VPMatrix", graph.getSharedUniform("VPMatrix"))
        .input("position", graph.getVertRoot())
    )
  }
  foreachProvider(visitor: (p: ShaderUniformProvider) => void): void {
    // trigger getter to update VP
    this._renderMatrix = this.projectionMatrix;

    return visitor(this);
  }

  getPropertyUniform(name: keyof Camera): ShaderCommonUniformInputNode {
    return getPropertyUniform(this, name)
  }

  notifyNeedRedecorate: Observable<ShaderUniformDecorator> = new Observable();
  nodeCreated: Map<string, ShaderCommonUniformInputNode> = new Map();

  hasAnyUniformChanged: boolean = true;
  uniforms: Map<string, any> = new Map();
  propertyUniformNameMap: Map<string, string> = new Map();

  abstract updateProjectionMatrix(): void;
  abstract onRenderResize(newSize: Size): void;

  projectionChanged() {
    this._projectionMatrixNeedUpdate = true;
    this._viewProjectionMatrixNeedUpdate = true;

  }

  updateRenderRatio(engine: RenderEngine) {
    this.onRenderResize({ width: engine.renderer.width, height: engine.renderer.height })
    return this;
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

  get viewProjectionMatrixNeedUpdate() {
    return this._viewProjectionMatrixNeedUpdate;
  }

  get viewProjectionMatrix(): Readonly<Matrix4> {
    if (this._viewProjectionMatrixNeedUpdate) {
      this._viewProjectionMatrix.multiplyMatrices(this.projectionMatrix, this.worldMatrixInverse);
      this._viewProjectionMatrixNeedUpdate = false;
    }
    return this._viewProjectionMatrix;
  }

  @MapUniform("worldPosition")
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
