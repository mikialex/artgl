import { RenderSource } from "../engine/render-engine";
import { RenderList } from "../engine/render-list";
import { Mesh } from "../object/mesh";
import { PlaneGeometry } from "../geometry/geo-lib/plane-geometry";

const renderList = new RenderList();
const quadMesh = new Mesh();
const geometry = new PlaneGeometry(2, 2, 1, 1);
quadMesh.geometry = geometry;
renderList.addRenderItem(quadMesh);
export class QuadSource implements RenderSource{
  getRenderList(): RenderList {
    return renderList;
  }

  resetSource() {
    renderList.resetCursor();
  }

  nextRenderable() {
    return renderList.next();
  }

  updateSource() {
    
  }

}
