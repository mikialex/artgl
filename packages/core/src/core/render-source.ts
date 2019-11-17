
import { Mesh } from "../scene-graph/object/mesh";
import { RenderObject } from "../scene-graph/object/render-object";
import { RenderEngine } from "./render-engine";
import { PlaneGeometry } from "../built-in-lib/plane-geometry";

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
    engine.render(quadMesh);
  }

}

export const QuadSourceInstance = new QuadSource();
