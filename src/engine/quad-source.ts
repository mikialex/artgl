import { RenderSource } from "./render-engine";
import { Mesh } from "../object/mesh";
import { PlaneGeometry } from "../geometry/geo-lib/plane-geometry";

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
