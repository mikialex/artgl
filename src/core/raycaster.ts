import { Vector3, Matrix4 } from "../math/index";
import { Nullable } from "../type";
import { Camera } from "./camera";
import { Ray } from "../math/entity/ray";
import { RenderSource, foreachRenderableInSource } from "../engine/render-engine";
import { RenderObject } from "./render-object";



export interface RayCasterable {

  /**
   * mark this obj is raycasterable
   */
  raycasterable: true

  /**
   * check if this obj has any hit, should early return.
   */
  raycastIfHit(raycaster: Raycaster): boolean

  /**
   * get all raycast point on this obj, push the results in results array
   */
  raycast(raycaster: Raycaster, results: RayCasterable[]);

  /**
   * get first raycast point on this obj, return null if not hit
   */
  raycastFirst(raycaster: Raycaster): Nullable<RayCastResult>
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
  worldRay: Ray;
  localRay: Ray;

  results: RayCasterable[] = [];

  setProjection(matrix: Matrix4) {
    
  }

  setProjectionFromCamera(camera: Camera) {

  }

  pick(source: RenderSource, preFilter?: (obj: RenderObject) => boolean) {
    foreachRenderableInSource(source, (obj) => {
      if (preFilter(obj) && (obj as unknown as RayCasterable).raycasterable) {
        (obj as unknown as RayCasterable).raycast(this, this.results);
      }
    })
  }

  pickFirst(source: RenderSource, preFilter?: (obj: RenderObject) => boolean) {
    
  }
}