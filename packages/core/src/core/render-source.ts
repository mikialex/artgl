
import { RenderObject } from "./render-object";
import { RenderEngine } from "./render-engine";
import { QuadGeometry } from "../built-in-lib/quad-geometry";
import { RenderItem } from "./render-list";
import { Matrix4 } from "@artgl/math";

/**
 * Every meaningful draw system like scene should produce drawcall as need.
 * These drawcall maybe sorted, or stored in different container data structure
 * Impl this interface, that use a iterator to collect sorted, prepared drawcall
 * from a given draw system. We call this type RenderSource
 */
export interface RenderSource {

  visitAllRenderObject(visitor: (item: RenderItem) => any): void;

  render(engine: RenderEngine): void;
}


const quadMesh = new RenderObject();
const geometry = new QuadGeometry();
const i = new Matrix4();
quadMesh.geometry = geometry;
const item = {
  object: quadMesh, 
  worldMatrix: i
}

export class QuadSource implements RenderSource {
  visitAllRenderObject(visitor: (item: RenderItem) => any) {
    visitor(item);
  }

  render(engine: RenderEngine) {
    engine.renderObject(quadMesh);
  }

}

export const QuadSourceInstance = new QuadSource();
