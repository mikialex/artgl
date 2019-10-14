import { SceneNode, ExtendWithSceneNode } from "../scene/scene-node";
import { Matrix4, Vector3 } from "../math/index";
import { RenderEngine, Size } from '../engine/render-engine';
import { ShaderUniformProvider, ShaderUniformDecorator, BaseEffectShading } from "./shading";
import { MapUniform } from "./shading-util";
import { ShaderGraph, WorldPositionFragVary } from "../shader-graph/shader-graph";
import { VPTransform, MTransform } from "../shader-graph/built-in/transform";
import { uniformFromValue, attribute, vec4, constValue } from "../shader-graph/node-maker";
import { CommonAttribute } from "../webgl/attribute";
import { GLDataType } from "./data-type";

export function MVP(graph: ShaderGraph) {
  if (graph.getIfSharedUniform(Camera.WorldMatrixKey) !== undefined &&
    graph.getIfSharedUniform(Camera.ViewProjectionMatrix) !== undefined
  ) {

    const worldPosition = MTransform.make()
      .input('MMatrix', graph.getSharedUniform(Camera.WorldMatrixKey))
      .input('position', attribute(CommonAttribute.position, GLDataType.floatVec3))
    return {
      MVP: VPTransform.make()
        .input("VPMatrix", graph.getSharedUniform(Camera.ViewProjectionMatrix))
        .input("position", worldPosition),
      worldPosition: worldPosition.swizzling('xyz')
    }
  } else {
    const rawPosition = vec4(attribute(CommonAttribute.position, GLDataType.floatVec3), constValue(1))
    return {
      MVP: rawPosition,
      worldPosition: rawPosition.swizzling('xyz')
    }
  }

}

/**
 * Camera is abstraction of a decoration of view projection matrix in a vertex graph
 * Implementor should impl how matrix is calculate and how to react to render size change
 */
export class CameraSelf
  extends BaseEffectShading<CameraSelf>
  implements ShaderUniformProvider, ShaderUniformDecorator {

  static readonly WorldMatrixKey = 'WorldMatrix'
  static readonly WorldPositionKey = 'CameraWorldPosition'
  static readonly ViewProjectionMatrix = 'CameraViewProjectionMatrix'

  @MapUniform(CameraSelf.WorldMatrixKey)
  renderObjectWorldMatrix = new Matrix4();

  @MapUniform(CameraSelf.ViewProjectionMatrix)
  _renderMatrix = new Matrix4();

  decorate(graph: ShaderGraph): void {
    graph.registerSharedUniform(CameraSelf.WorldPositionKey, this.getPropertyUniform('_worldPosition'))
    graph.registerSharedUniform(CameraSelf.ViewProjectionMatrix, this.getPropertyUniform('_renderMatrix'))
    graph.registerSharedUniform(CameraSelf.WorldMatrixKey, uniformFromValue(CameraSelf.WorldMatrixKey, this.worldMatrix))
    const { MVP: MVPResult, worldPosition } = MVP(graph)
    graph.setVertexRoot(MVPResult);
    graph.setVary(WorldPositionFragVary, worldPosition)
  }
  foreachProvider(visitor: (p: ShaderUniformProvider) => void): void {
    // trigger getter to update VP
    this._renderMatrix = this.viewProjectionMatrix;

    this._worldPosition = this.transform.position;

    return visitor(this);
  }

  updateProjectionMatrix(): void {
    throw 'missing impl'
  }
  onRenderResize(newSize: Size): void {
    throw 'missing impl'
  }

  notifyProjectionChanged() {
    this._projectionMatrixNeedUpdate = true;

  }

  updateRenderRatio(engine: RenderEngine) {
    this.onRenderResize({ width: engine.renderer.width, height: engine.renderer.height })
    return this;
  }

  _projectionMatrix = new Matrix4();
  _projectionMatrixNeedUpdate = true;

  enableProjectionJitter = false;
  jitterWidth = 100000;
  jitterHeight = 100000;
  jitter(width: number, height: number) {
    this.enableProjectionJitter = true;
    this.jitterWidth = width;
    this.jitterHeight = height;
    this.notifyProjectionChanged();
    return this;
  }

  get projectionMatrix(): Readonly<Matrix4> {
    if (this._projectionMatrixNeedUpdate) {
      this.updateProjectionMatrix();
      if (this.enableProjectionJitter) {

        this._projectionMatrix.elements[8] += ((2 * Math.random() - 1) / this.jitterWidth);
        this._projectionMatrix.elements[9] += ((2 * Math.random() - 1) / this.jitterHeight);
      }

      this._projectionMatrixNeedUpdate = false;
    }
    return this._projectionMatrix
  }

  // todo
  // _worldMatrixInverse = new Matrix4();
  // _worldMatrixInverseNeedUpdate = true;

  // get worldMatrixInverse(): Readonly<Matrix4> {
  //   if (this._worldMatrixInverseNeedUpdate) {
  //     this.worldMatrix.getInverse(this._worldMatrixInverse, false);
  //     this._worldMatrixInverseNeedUpdate = false;
  //   }
  //   return this._worldMatrixInverse;
  // }

  _viewProjectionMatrix = new Matrix4();

  get viewProjectionMatrixNeedUpdate() {
    return this.localTransformSyncVPUpdateId !== this.transform.transformChangedId ||
      this._projectionMatrixNeedUpdate;
  }

  localTransformSyncVPUpdateId = -1;
  get viewProjectionMatrix(): Readonly<Matrix4> {
    if (this.viewProjectionMatrixNeedUpdate) {
      // this._viewProjectionMatrix.multiplyMatrices(this.projectionMatrix, this.worldMatrixInverse); // todo
      this._viewProjectionMatrix.multiplyMatrices(this.projectionMatrix, this.transform.inverseMatrix);
      this.localTransformSyncVPUpdateId = this.transform.transformChangedId
    }
    return this._viewProjectionMatrix;
  }

  @MapUniform("worldPosition")
  _worldPosition = new Vector3();

  // todo
  //   _worldPositionNeedUpdate = true;
  //   get worldPosition(): Readonly<Vector3> {
  //     if (this._worldPositionNeedUpdate) {
  //       this.worldMatrix.getPosition(this._worldPosition)
  //       this._worldPositionNeedUpdate = false;
  //     }
  //     return this._worldPosition;
  //   }

}

export interface CameraSelf extends SceneNode { }
export interface Camera extends SceneNode, CameraSelf { }
export const Camera = ExtendWithSceneNode(CameraSelf)

// https://dev.to/angular/decorators-do-not-work-as-you-might-expect-3gmj
export function ProjectionMatrixNeedUpdate<T>(_target: any, _propertyKey: any): any {
  const key = Symbol();

  return {
    get(): T {
      return (this as any)[key];
    },
    set(newValue: T) {
      (this as any)[key] = newValue;
      (this as unknown as Camera).notifyProjectionChanged();
    }
  }
}
