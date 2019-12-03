import { Vector3, Matrix4, Ray } from "@artgl/math"
import { Nullable } from "@artgl/shared";

export interface RayCastSource{
  foreachRaycasterable(visitor: (obj: RayCasterable, matrix: Matrix4)=> boolean): void;
}

export interface RayCasterable {

  /**
   * mark this obj is raycasterable
   */
  raycasterable: true

  /**
   * check if this obj has any hit, should early return.
   */
  raycastIfHit(raycaster: Raycaster, worldMatrix: Matrix4): boolean

  /**
   * get all raycast point on this obj, push the results in results array
   */
  raycast(raycaster: Raycaster, results: RayCastResult[], worldMatrix: Matrix4): RayCastResult[]

  /**
   * get first raycast point on this obj, return null if not hit
   */
  raycastFirst(raycaster: Raycaster, worldMatrix: Matrix4): Nullable<RayCastResult>
}


/**
 * A general raycast result
 */
export interface RayCastResult {

  /**
   * hit object
   */
  object: RayCasterable

  worldMatrix: Matrix4

  /**
  * The hit position in object's local space.
  * When you need world space position, just multiply the world matrix from
  * the object. This is done by your self for saving unnecessary computation
  */
  hitLocalPosition: Vector3
}

export interface ScreenSpaceRayProvider {
  updateRaycaster(caster: Raycaster, xRate: number, yRate: number): void;
}


/**
 * For raycast a given render source
 */
export class Raycaster {
  near: number = 0;
  far: number = 1;
  worldRay: Ray = new Ray();
  private localRay: Ray = new Ray();

  update(rayProvider: ScreenSpaceRayProvider, xRate: number, yRate: number) {
    rayProvider.updateRaycaster(this, xRate, yRate);
  }

  getLocalRay(worldMatrix: Matrix4): Readonly<Ray> {
    return this.localRay.copy(this.worldRay).applyMatrix4(worldMatrix);
  }

  pick(source: RayCastSource, preFilter?: (obj: RayCasterable) => boolean) {
    const results: RayCastResult[] = [];
    source.foreachRaycasterable((obj, matrix) => {

      if (preFilter !== undefined && !preFilter(obj)) {
        return true;
      }

      (obj as unknown as RayCasterable).raycast(this, results, matrix);
      
      return true;
    })
    return results;
  }

  pickFirst(source: RayCastSource, preFilter?: (obj: RayCasterable) => boolean) {
    // TODO use pre exist 
    return this.pick(source, preFilter).map(re => {
      const hitWorldPosition = re.hitLocalPosition.applyMatrix4(re.worldMatrix);
      return {
        cameraDistance: this.worldRay.origin.distanceTo(hitWorldPosition),
        hitWorldPosition,
        object: re.object
      }
    }).sort((a, b) => {
      return b.cameraDistance - a.cameraDistance
    }).pop();
  }
}