import { RenderSource } from "../engine/render-engine";
import { RenderList } from "../engine/render-list";
import { Mesh } from "../object/mesh";
import { PlaneGeometry } from "../geometry/geo-lib/plane-geometry";

const renderlist = new RenderList();
const quadMesh = new Mesh();
const geometry = new PlaneGeometry(2, 2, 1, 1);
quadMesh.geometry = geometry;
renderlist.addRenderItem(quadMesh);
export class QuadSource implements RenderSource{
  getRenderList(): RenderList {
    return renderlist;
  }

  resetSource() {
    renderlist.resetCursor();
  }

  nextRenderable() {
    return renderlist.next();
  }

  updateSource() {
    
  }

}
