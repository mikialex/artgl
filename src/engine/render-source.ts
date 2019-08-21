
import { Mesh } from "../object/mesh";
import { PlaneGeometry } from "../geometry/geo-lib/plane-geometry";
import { RenderObject } from "../core/render-object";
import { Nullable } from "../type";

export interface RenderSource {
  resetSource(): void;
  nextRenderable(): Nullable<RenderObject>;
  updateSource(): void;
}

export function foreachRenderableInSource(source: RenderSource, visitor: (obj: RenderObject) => any) {
  source.updateSource();
  source.resetSource();
  let nextSource: RenderObject | null = null;
  do {
    nextSource = source.nextRenderable();
    if (nextSource !== null) {
      visitor(nextSource);
    }
  } while (nextSource !== null);
}

const quadMesh = new Mesh();
const geometry = new PlaneGeometry(2, 2, 1, 1);
quadMesh.geometry = geometry;
export class QuadSource implements RenderSource{
  hasRendered: boolean = false;

  resetSource() {
    this.hasRendered = false;
  }

  nextRenderable() {
    if (this.hasRendered) {
      return null
    }
    this.hasRendered = true;
    return quadMesh
  }

  updateSource() {}

}
