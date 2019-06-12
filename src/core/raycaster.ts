import { Vector3, Matrix4 } from "../math/index";
import { Nullable } from "../type";
import { Camera } from "./camera";
import { Ray } from "../math/entity/ray";


export interface RayCasterable {
  raycastHit(): boolean
  raycast(): Nullable<RayCastResult>
}

export interface RayCastResult{
  hitLocalPosition: Vector3
}

export class Raycaster {
  projection: Matrix4;
  ray: Ray;

  setProjection(matrix: Matrix4) {
    
  }

  setProjectionFromCamera(camera: Camera) {

  }

  pick() {
    
  }

  pickFirst() {
    
  }
}