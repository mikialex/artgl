import { Vector3, Matrix4, MathUtil} from "../math";

export class PerspectiveCamera {
  
  near: number;
  far: number;

  fov: number;
  aspect: number;
  zoom: number;

  projectionMatrix = new Matrix4();

  updateProjectionMatrix () {
    const top = this.near * Math.tan(MathUtil.DEG2RAD * 0.5 * this.fov) / this.zoom;
    const height = 2 * top;
    const width = this.aspect * height;
    const left = - 0.5 * width;
    this.projectionMatrix.makePerspective(left, left + width, top, top - height, this.near, this.far);
  }


  
}