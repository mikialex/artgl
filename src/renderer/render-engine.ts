import { GLRenderer } from "./webgl-renderer";
import { RenderList } from "./render-list";
import { LightList } from "./light-list";

export class ARTEngineAdaptor {
  constructor(engine: ARTEngine) {
    this.engine = engine;
  }
  engine: ARTEngine;

  update() {
    
  }
}



export class ARTEngine {
  constructor(renderer:GLRenderer) {
    this.renderer = renderer;
  }

  renderer: GLRenderer;

  renderList: RenderList = new RenderList();
  lightList: LightList = new LightList();

  adaptor: ARTEngineAdaptor;

  useAdaptor(adaptor: ARTEngineAdaptor) {
    this.adaptor = adaptor;
  }

  // render renderList
  render() {
    
  }

  // render a single Object
  renderDirect() {

  }



}