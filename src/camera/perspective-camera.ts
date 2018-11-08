import { Vector3, Matrix4, MathUtil} from "../math";
import { Camera } from "../core/camera";

const tempMatrix = new Matrix4();

export class PerspectiveCamera extends Camera{
  constructor(near?: number, far?: number,
    fov?: number, aspect?: number, zoom?:number) {
    super();
    this.fov = fov !== undefined ? fov : 50;
    this.zoom = 1;
  
    this.near = near !== undefined ? near : 0.1;
    this.far = far !== undefined ? far : 2000;
  
    this.aspect = aspect !== undefined ? aspect : 1;
  
    this.updateProjectionMatrix();
  }

  near: number;
  far: number;

  fov: number;
  aspect: number;
  zoom: number;

  get width() {
    return this.aspect * this.height;
  }
  get height() {
    return 2 * this.near * Math.tan(MathUtil.DEG2RAD * 0.5 * this.fov) / this.zoom;
  }

  updateProjectionMatrix () {
    const top = this.near * Math.tan(MathUtil.DEG2RAD * 0.5 * this.fov) / this.zoom;
    const height = 2 * top;
    const width = this.aspect * height;
    const left = - 0.5 * width;
    this.projectionMatrix.makePerspective(left, left + width, top, top - height, this.near, this.far);
  }

  up = new Vector3(0, 1, 0);
  lookAt(targetPosition: Vector3) {
    tempMatrix.lookAt(this.position, targetPosition, this.up);
    this.quaternion.setFromRotationMatrix(tempMatrix);
    this.updateLocalMatrix();
  }


  
}