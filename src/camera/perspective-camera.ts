import { Vector3, Matrix4, MathUtil } from "../math/index";
import { Camera, ProjectionMatrixNeedUpdate } from "../core/camera";
import { ScreenSpaceRayProvider, Raycaster } from "../core/raycaster";
import { Size } from "../engine/render-engine";

const tempMatrix = new Matrix4();

export class PerspectiveCamera extends Camera implements ScreenSpaceRayProvider {
  constructor(near?: number, far?: number,
    fov?: number, aspect?: number, zoom?: number) {
    super();
    this.fov = fov !== undefined ? fov : 50;
    this.zoom = zoom !== undefined ? zoom : 1;

    this.near = near !== undefined ? near : 0.1;
    this.far = far !== undefined ? far : 2000;

    this.aspect = aspect !== undefined ? aspect : 1;

    this.updateProjectionMatrix();
  }

  
  @ProjectionMatrixNeedUpdate<PerspectiveCamera>()
  near: number;
  
  @ProjectionMatrixNeedUpdate<PerspectiveCamera>()
  far: number;

  @ProjectionMatrixNeedUpdate<PerspectiveCamera>()
  fov: number;
  
  @ProjectionMatrixNeedUpdate<PerspectiveCamera>()
  aspect: number;
  
  @ProjectionMatrixNeedUpdate<PerspectiveCamera>()
  zoom: number;

  up = new Vector3(0, 1, 0); // todo change watch

  get width() {
    return this.aspect * this.height;
  }
  get height() {
    return 2 * this.near * Math.tan(MathUtil.DEG2RAD * 0.5 * this.fov) / this.zoom;
  }

  updateProjectionMatrix() {
    const top = this.near * Math.tan(MathUtil.DEG2RAD * 0.5 * this.fov) / this.zoom;
    const height = 2 * top;
    const width = this.aspect * height;
    const left = - 0.5 * width;
    this._projectionMatrix.makePerspective(left, left + width, top, top - height, this.near, this.far);
    this._projectionMatrixNeedUpdate = false;
  }

  lookAt(targetPosition: Vector3) {
    tempMatrix.lookAt(this.transform.position, targetPosition, this.up);
    this.transform.quaternion.setFromRotationMatrix(tempMatrix);
  }

  updateRaycaster(caster: Raycaster, xRate: number, yRate: number): void {
    caster.worldRay.origin.setFromMatrixPosition(this.worldMatrix);
    caster.worldRay.direction.set(xRate, yRate, 0.5)
      .unProject(this.worldMatrix, this.projectionMatrix)
      .sub(caster.worldRay.origin)
      .normalize();
  }

  onRenderResize = (size: Size) => {
    this.aspect = size.width / size.height;
  }

}