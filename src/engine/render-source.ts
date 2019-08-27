
import { Mesh } from "../object/mesh";
import { PlaneGeometry } from "../geometry/geo-lib/plane-geometry";
import { RenderObject } from "../core/render-object";

export interface RenderSource {
  resetSource(): void;
  nextRenderable(render: (object: RenderObject) => void): boolean;
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
