import { Vector3, Matrix4, MathUtil } from "../math/index";
import { Camera } from "../core/camera";
import { ScreenSpaceRayProvider, Raycaster } from "../core/raycaster";

const tempMatrix = new Matrix4();

export class PerspectiveCamera extends Camera implements ScreenSpaceRayProvider {
  constructor(near?: number, far?: number,
    fov?: number, aspect?: number, zoom?: number) {
    super();
    this._fov = fov !== undefined ? fov : 50;
    this._zoom = 1;

    this._near = near !== undefined ? near : 0.1;
    this._far = far !== undefined ? far : 2000;

    this._aspect = aspect !== undefined ? aspect : 1;

    this.updateProjectionMatrix();
  }

  _near: number;
  get near() { return this._near };
  set near(value) { this._near = value; this.projectionMatrixNeedUpdate = true };
  _far: number;
  get far() { return this._far };
  set far(value) { this._far = value; this.projectionMatrixNeedUpdate = true };

  _fov: number;
  get fov() { return this._fov };
  set fov(value) { this._fov = value; this.projectionMatrixNeedUpdate = true };
  _aspect: number;
  get aspect() { return this._aspect };
  set aspect(value) { this._aspect = value; this.projectionMatrixNeedUpdate = true };
  _zoom: number;
  get zoom() { return this._zoom };
  set zoom(value) { this._zoom = value; this.projectionMatrixNeedUpdate = true };

  up = new Vector3(0, 1, 0);

  get width() {
    return this._aspect * this.height;
  }
  get height() {
    return 2 * this._near * Math.tan(MathUtil.DEG2RAD * 0.5 * this._fov) / this._zoom;
  }

  updateProjectionMatrix() {
    const top = this._near * Math.tan(MathUtil.DEG2RAD * 0.5 * this._fov) / this._zoom;
    const height = 2 * top;
    const width = this._aspect * height;
    const left = - 0.5 * width;
    this.projectionMatrix.makePerspective(left, left + width, top, top - height, this._near, this._far);
    this.projectionMatrixNeedUpdate = false;
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

}