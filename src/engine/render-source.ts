
import { Mesh } from "../object/mesh";
import { PlaneGeometry } from "../geometry/geo-lib/plane-geometry";
import { RenderObject } from "../core/render-object";

/**
 * Every meaningful draw system like scene should produce drawcall as need.
 * These drawcall maybe sorted, or stored in different container data structure
 * Impl this interface, that use a iterator to collect sorted, prepared drawcall
 * from a given draw system. We call this type RenderSource
 */
export interface RenderSource {

  /**
   * When sometimes iterator need reset to first
   */
  resetSource(): void;


  /**
   * Outside will continuously call this until return false to render all 
   * drawcall.  A render callback is passed, RenderSource can use temp renderObject
   * to impl scene level override mechanism. or do something before or after every drawcall
   */
  nextRenderable(render: (object: RenderObject) => void): boolean;

  /**
   * A RenderSource maybe need update, to refresh drawcall generation
   */
  updateSource(): void;
}

export function foreachRenderableInSource(source: RenderSource, visitor: (obj: RenderObject) => any) {
  source.updateSource();
  source.resetSource();
  let hasNextSource: boolean = false;
  do {
    hasNextSource = source.nextRenderable(visitor);
  } while (hasNextSource);
}

const quadMesh = new Mesh();
const geometry = new PlaneGeometry(2, 2, 1, 1);
quadMesh.geometry = geometry;

export class QuadSource implements RenderSource {
  hasRendered: boolean = false;

  resetSource() {
    this.hasRendered = false;
  }

  nextRenderable(render: (object: RenderObject) => void) {
    if (this.hasRendered) {
      return false
    }
    this.hasRendered = true;
    render(quadMesh);
    return true
  }

  updateSource() { }

}
