import { Controller } from "./controller";
import { Spherical } from "../math/spherical";
import { Interactor } from "./interactor";
import { Vector2 } from "../math/vector2";
import { Vector3, MathUtil } from "../math/index";
import { PerspectiveCamera } from "../camera/perspective-camera";


const tempVec = new Vector3();

export class OrbitController extends Controller {

  constructor(public camera: PerspectiveCamera) {
    super();
    this.camera = camera;

    const v = new Vector3();
    v.copy(camera.transform.position).sub(this.spherical.center);
    this.spherical.setFromVector(v);
  }

  spherical: Spherical = new Spherical();

  rotateAngleFactor = 0.2
  panFactor = 0.0002
  zoomFactor = 0.3;

  // restriction
  maxPolarAngle = 179 / 180 * Math.PI;
  minPolarAngle = 0.1;

  // damping
  sphericalDelta: Spherical = new Spherical(0, 0, 0);
  zooming: number = 1;
  panOffset: Vector3 = new Vector3();

  enableDamping = true;
  zoomingDampingFactor = 0.1;
  rotateDampingFactor = 0.1;
  panDampingFactor = 0.1;


  public registerInteractor(interactor: Interactor) {
    if (this.interactor !== undefined) {
      this.interactor.unbindControllerAllListener(this);
    }
    this.interactor = interactor;
    this.interactor.bindLeftMouseMove(this, this.rotate);
    this.interactor.bindRightMouseMove(this, this.move);
    this.interactor.bindMouseWheel(this, this.zoom);
  }


  // operate methods
  rotate = (offset: Vector2) => {
    const viewWidth = this.camera.width * 5000;
    const viewHeight = this.camera.height * 5000;

    this.sphericalDelta.polar += offset.y / viewHeight * Math.PI * this.rotateAngleFactor
    this.sphericalDelta.azim += offset.x / viewWidth * Math.PI * this.rotateAngleFactor

    this.needUpdate = true;
  }
  zoom = (factor: number) => {
    this.zooming = 1 + (factor - 1) * this.zoomFactor;
    this.needUpdate = true;
  }
  move = (offset: Vector2) => {
    offset.rotate(-this.spherical.azim).multiplyScalar(this.spherical.radius * this.panFactor);


    this.panOffset.x += offset.x;
    this.panOffset.z += offset.y;
    this.needUpdate = true;
  }

  public needUpdate: boolean = true;


  public update() {

    if (Math.abs(this.sphericalDelta.azim) > 0.0001 ||
      Math.abs(this.sphericalDelta.polar) > 0.0001 ||
      Math.abs(this.sphericalDelta.radius) > 0.0001 ||
      Math.abs(this.zooming - 1) > 0.0001 ||
      this.panOffset.mag() > 0.0001
    ) {
      this.needUpdate = true;
    }


    if (this.needUpdate) {
      this.spherical.radius *= this.zooming;

      this.spherical.azim += this.sphericalDelta.azim;

      this.spherical.polar = MathUtil.clamp(
        this.spherical.polar + this.sphericalDelta.polar,
        this.minPolarAngle, this.maxPolarAngle);

      this.spherical.center.add(this.panOffset);

      tempVec.setFromSpherical(this.spherical).add(this.spherical.center);
      this.camera.transform.position.copy(tempVec);
      this.camera.lookAt(this.spherical.center);
    }
    this.needUpdate = false;

    // update damping effect
    if (this.enableDamping === true) {
      this.sphericalDelta.azim *= (1 - this.rotateDampingFactor);
      this.sphericalDelta.polar *= (1 - this.rotateDampingFactor);
      this.zooming = this.zooming + (1 - this.zooming) * this.zoomingDampingFactor;
      this.panOffset.multiplyScalar(1 - this.panDampingFactor);
    } else {
      this.sphericalDelta.set(0, 0, 0);
      this.zooming = 1;
      this.panOffset.set(0, 0, 0);
    }
  }

}