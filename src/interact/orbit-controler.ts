import { Controler } from "./controler";
import { Spherical } from "../math/spherical";
import { Interactor } from "./interactor";
import { Vector2 } from "../math/vector2";
import { Vector3, MathUtil } from "../math/index";
import { PerspectiveCamera } from "../camera/perspective-camera";

const MaxPolarAngle = 179 / 180 * Math.PI;
const MinPolarAngle = 0.1;
const RotateAngleFactor = 2.5;

const tempVec = new Vector3();

export class OrbitController extends Controler {

  constructor(public camera: PerspectiveCamera) {
    super();
    this.camera = camera;
    this.spherical = new Spherical();

    const v = new Vector3();
    v.copy(camera.transform.position).sub(this.spherical.center);
    this.spherical.setFromVector(v);
  }

  public spherical: Spherical;

  public registerInteractor(interactor: Interactor) {
    if (this.interactor !== undefined) {
      this.interactor.unbindControlerAllListener(this);
    }
    this.interactor = interactor;
    this.interactor.bindLeftMouseMove(this, this.rotate);
    this.interactor.bindRightMouseMove(this, this.move);
    this.interactor.bindMouseWheel(this, this.zoom);
  }

  private rotate = (offset: Vector2) => {
    const viewWidth = this.camera.width * 5000;
    const viewHeight = this.camera.height * 5000;
    this.spherical.azim += offset.x / viewWidth * Math.PI * RotateAngleFactor;
    this.spherical.polar = MathUtil.clamp(this.spherical.polar + offset.y / viewHeight * Math.PI * RotateAngleFactor, MinPolarAngle, MaxPolarAngle);
  }

  private zoom = (factor: number) => {
    this.spherical.radius *= factor;
  }

  private move = (offset: Vector2) => {
    offset.rotate(-this.spherical.azim).multiplyScalar(this.spherical.radius * 0.002);
    this.spherical.center.x += offset.x;
    this.spherical.center.z += offset.y;
  }

  public update() {
    tempVec.setFromSpherical(this.spherical).add(this.spherical.center);
    this.camera.transform.position.copy(tempVec);
    this.camera.lookAt(this.spherical.center);
  }

}