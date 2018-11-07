import { Controler } from "./controler";
import { Spherical } from "../math/spherical";
import { Interactor } from "./interactor";
import { Vector2 } from "../math/vector2";
import { Vector3 } from "../math";
import { Camera } from "../core/camera";

const MaxPolarAngle = 179 / 180 * Math.PI;
const MinPolarAngle = 0.1;
const RotateAngleFactor = 2.5;

export default class OrbitController extends Controler {

  constructor(public camera: Camera, interactor: Interactor) {
    super(interactor);

    this.interactor.leftMouseMove = this.rotate;
    this.interactor.rightMouseMove = this.move;
    this.interactor.mouseWheel = this.zoom;

    this.spherical = new Spherical();
    const v = new Vector3();
    v.copy(camera.position).sub(this.spherical.center);
    this.spherical.setFromVector(v);
  }

  private rotate = (offset: Vector2) => {
    // this.spherical.azim += offset.x / this.camera.size.width * Math.PI * RotateAngleFactor;
    // this.spherical.polar = clamp(this.spherical.polar - offset.y / this.camera.size.height * Math.PI * RotateAngleFactor, MinPolarAngle, MaxPolarAngle);
  }

  private zoom = (factor: number) => {
    this.spherical.radius *= factor;
  }

  private move = (offset: Vector2) => {
    offset.rotate(this.spherical.azim).multiplyScalar(this.spherical.radius * 0.002);
    this.spherical.center.x += offset.x;
    this.spherical.center.z -= offset.y;
  }


  public interactor: Interactor;
  public spherical: Spherical;

}