import { Vector3, Matrix4 } from "../math/index";
import { Nullable } from "../type";
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
  raycast(raycaster: Raycaster, results: RayCastResult[]);

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

export interface ScreenSpaceRayProvider{
  updateRaycaster(caster: Raycaster, xRate: number, yRate: number): void;
}


/**
 * For raycast a given render source
 */
export class Raycaster {
  near: number = 0;
  far: number = 1;
  worldRay: Ray = new Ray();
  localRay: Ray = new Ray();

  results: RayCastResult[] = [];

  update(rayProvider: ScreenSpaceRayProvider, xRate: number, yRate: number) {
    rayProvider.updateRaycaster(this, xRate, yRate);
  }

  getLocalRay(worldMatrix: Matrix4): Readonly<Ray> {
    return this.localRay.copy(this.worldRay).applyMatrix4(worldMatrix);
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