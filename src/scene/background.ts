import { Vector4 } from "../math";
import { RenderEngine } from "../engine/render-engine";
import { Shading } from "../core/shading";
import { SkyShading } from "../shading/basic-lib/sky";
import { SphereGeometry } from "../geometry/geo-lib/sphere-geometry";
import { Mesh } from "../object/mesh";
import { CullSide } from "../webgl/const";

export abstract class BackGround{
  abstract render(engine: RenderEngine): void;
}

export class PureColorBackGround extends BackGround{
  color: Vector4 = new Vector4(0.8, 0.8, 0.8, 1.0);
  private beforeColor: Vector4 = new Vector4();

  render(engine: RenderEngine) {
    engine.getClearColor(this.beforeColor);
    engine.setClearColor(this.color);
    engine.clearColor();
  }
}

const domeSphere = new SphereGeometry()

export class SkyBackGround extends BackGround {
  skyShading = new Shading().decorate(new SkyShading())
  domeMesh = new Mesh().g(domeSphere).s(this.skyShading)

  constructor() {
    super();
    this.domeMesh.transform.scale.setAll(100);
    this.domeMesh.updateWorldMatrix();
    this.domeMesh.state.cullSide = CullSide.CullFaceNone
  }

  render(engine: RenderEngine) {
    engine.renderObject(this.domeMesh);
  }
}



