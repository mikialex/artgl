import { Vector3, Matrix4 } from "../math/index";
import { Nullable } from "../type";
import { Camera } from "./camera";
import { Ray } from "../math/entity/ray";
import { RenderSource } from "../engine/render-engine";
import { RenderObject } from "./render-object";



export interface RayCasterable {
  raycastHit(): boolean
  raycast(): Nullable<RayCastResult>
}


/**
 * A general raycast result
 */
export interface RayCastResult{

  /**
   * hit object
   */
  object: RenderObject

  /**
  * The hit position in object's local space.
  * When you need world space position, just multiply the world matrix from
  * the object. This is done by your self for saving unnecessary computation
  */
  hitLocalPosition: Vector3
}


/**
 * For raycast a given render source
 */
export class Raycaster {
  projection: Matrix4;
  ray: Ray;

  setProjection(matrix: Matrix4) {
    
  }

  setProjectionFromCamera(camera: Camera) {

  }

  pick(source: RenderSource, preFilter) {
    
  }

  pickFirst(source: RenderSource, preFilter) {
    
  }
}