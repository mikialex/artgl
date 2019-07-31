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
  rotateAngleFactor = 0.5

  // restriction
  maxPolarAngle = 179 / 180 * Math.PI;
  minPolarAngle = 0.1;

  // damping
  sphericalDelta: Spherical = new Spherical(0, 0, 0);
  zoomingFactor: number = 1;
  enableDamping = true;
  dampingFactor = 0.25;


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
    this.zoomingFactor = factor;
    this.needUpdate = true;
  }
  move = (offset: Vector2) => {
    offset.rotate(-this.spherical.azim).multiplyScalar(this.spherical.radius * 0.002);
    this.spherical.center.x += offset.x;
    this.spherical.center.z += offset.y;
    this.needUpdate = true;
  }

  public needUpdate: boolean = true;


  public update() {

    if (this.sphericalDelta.azim > 0.0001 ||
      this.sphericalDelta.polar > 0.0001 ||
      this.sphericalDelta.radius > 0.0001 ||
      Math.abs(this.zoomingFactor - 1) > 0.0001
      ) {
      this.needUpdate = true;
    }


    if (this.needUpdate) {
      this.spherical.radius *= this.zoomingFactor;
      this.spherical.azim += this.sphericalDelta.azim;
      this.spherical.polar = MathUtil.clamp(
        this.spherical.polar + this.sphericalDelta.polar,
        this.minPolarAngle, this.maxPolarAngle);
      tempVec.setFromSpherical(this.spherical).add(this.spherical.center);
      this.camera.transform.position.copy(tempVec);
      this.camera.lookAt(this.spherical.center);
    }
    this.needUpdate = false;

    // update damping effect
    if (this.enableDamping === true) {
      this.sphericalDelta.azim *= (1 - this.dampingFactor);
      this.sphericalDelta.polar *= (1 - this.dampingFactor);
      this.zoomingFactor = this.zoomingFactor + (1 - this.zoomingFactor) * this.dampingFactor;
      // this.zoomingFactor *= (1 - this.dampingFactor);
      // panOffset.multiplyScalar( 1 - this.dampingFactor );
    } else {
      this.sphericalDelta.set(0, 0, 0);
      this.zoomingFactor = 1;
      // this.panOffset.set( 0, 0, 0 );
    }
  }

}