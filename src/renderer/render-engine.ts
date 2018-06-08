import { GLRenderer } from "./webgl-renderer";
import { RenderList } from "./render-list";
import { LightList } from "./light-list";

export class ARTEngine {
  constructor(renderer:GLRenderer) {
    this.renderer = renderer;
  }

  renderer: GLRenderer;

  renderList: RenderList = new RenderList();
  lightList: LightList = new LightList();

  

}