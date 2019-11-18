import { Controller } from "./controller";
import { Interactor } from "./interactor";
import { Vector3, MathUtil, Vector2, Spherical  } from "@artgl/math";
import { Camera } from "../core/camera";


const tempVec = new Vector3();

export class OrbitController extends Controller {

  constructor(public camera: Camera) {
    super();
    this.camera = camera;
    this.reloadStates();
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

  viewWidth = window.innerWidth;
  viewHeight = window.innerHeight;


  public registerInteractor(interactor: Interactor) {
    if (this.interactor !== null) {
      this.interactor.unbindControllerAllListener(this);
    }
    this.interactor = interactor;
    this.interactor.bindLeftMouseMove(this, this.rotate);
    this.interactor.bindRightMouseMove(this, this.move);
    this.interactor.bindMouseWheel(this, this.zoom);
  }


  // operate methods
  rotate = (offset: Vector2) => {

    this.sphericalDelta.polar += offset.y / this.viewHeight * Math.PI * this.rotateAngleFactor
    this.sphericalDelta.azim += offset.x / this.viewWidth * Math.PI * this.rotateAngleFactor

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

  
  reloadStates(): void {
    tempVec.copy(this.camera.transform.position).sub(this.spherical.center);
    this.spherical.setFromVector(tempVec);
  }


  public update() {

    if (Math.abs(this.sphericalDelta.azim) > 0.0001 ||
      Math.abs(this.sphericalDelta.polar) > 0.0001 ||
      Math.abs(this.sphericalDelta.radius) > 0.0001 ||
      Math.abs(this.zooming - 1) > 0.0001 ||
      this.panOffset.mag() > 0.0000001
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