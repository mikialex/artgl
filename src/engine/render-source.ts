
import { Mesh } from "../object/mesh";
import { PlaneGeometry } from "../geometry/geo-lib/plane-geometry";
import { RenderObject } from "../core/render-object";
import { RenderEngine } from "./render-engine";

/**
 * Every meaningful draw system like scene should produce drawcall as need.
 * These drawcall maybe sorted, or stored in different container data structure
 * Impl this interface, that use a iterator to collect sorted, prepared drawcall
 * from a given draw system. We call this type RenderSource
 */
export interface RenderSource {

  visitAllRenderObject(visitor: (item: RenderObject) => any): void;

  render(engine: RenderEngine): void;
}


const quadMesh = new Mesh();
const geometry = new PlaneGeometry(2, 2, 1, 1);
quadMesh.geometry = geometry;

export class QuadSource implements RenderSource {
  visitAllRenderObject(visitor: (item: RenderObject) => any) {
    visitor(quadMesh);
  }

  render(engine: RenderEngine) {
    engine.renderObject(quadMesh);
  }

}

export const QuadSourceInstance = new QuadSource();
