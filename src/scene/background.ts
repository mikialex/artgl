import { Vector4 } from "../math";
import { RenderEngine } from "../engine/render-engine";
import { Shading } from "../core/shading";
import { SkyShading } from "../shading/basic-lib/sky";
import { SphereGeometry } from "../geometry/geo-lib/sphere-geometry";
import { Mesh } from "../object/mesh";

export abstract class BackGround{
  abstract render(engine: RenderEngine): void;
}

export class PureColorBackGround extends BackGround{
  color: Vector4 = new Vector4(0.5, 0.5, 0.5, 1.0);
  private beforeColor: Vector4 = new Vector4();

  render(engine: RenderEngine) {
    engine.getClearColor(this.beforeColor);
    engine.setClearColor(this.color);
    engine.clearColor();
  }
}

const domeSphere = new SphereGeometry()
const domeMesh = new Mesh().g(domeSphere)

export class SkyBackGround extends BackGround {
  skyShading = new Shading().decorate(new SkyShading())


  render(engine: RenderEngine) {
    engine.renderObject(domeMesh);
  }
}



