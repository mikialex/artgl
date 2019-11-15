import { Vector4 } from "@artgl/math";
import { RenderEngine } from "../engine/render-engine";
import { Shading } from "../core/shading";
import { SkyShading } from "../shading/basic-lib/sky";
import { SphereGeometry } from "../geometry/geo-lib/sphere-geometry";
import { Mesh } from "../object/mesh";
import { CubeTexture } from "../core/texture-cube";
import { CubeEnvMapShading } from "../shading/basic-lib/cube-env-map";
import { CullSide } from "@artgl/webgl";

export abstract class Background {
  abstract render(engine: RenderEngine): void;
}

export class SolidColorBackground extends Background {
  color: Vector4 = new Vector4(0.8, 0.8, 0.8, 1.0);
  private beforeColor: Vector4 = new Vector4();

  render(engine: RenderEngine) {
    engine.getClearColor(this.beforeColor);
    engine.setClearColor(this.color);
    engine.clearColor();
  }
}

const domeSphere = new SphereGeometry()

export class SkyBackground extends Background {
  skyShading = new Shading().decoCamera().decorate(new SkyShading())
  private domeMesh = new Mesh().g(domeSphere).s(this.skyShading)

  constructor() {
    super();
    this.domeMesh.transform.scale.setAll(100);
    this.domeMesh.updateWorldMatrix();
    this.domeMesh.state.cullSide = CullSide.CullFaceNone
  }

  render(engine: RenderEngine) {
    engine.render(this.domeMesh);
  }
}

export class CubeEnvrionmentMapBackGround extends Background {

  envMapDeco = new CubeEnvMapShading();
  shading: Shading;
  private domeMesh = new Mesh().g(domeSphere).s(this.shading)

  private _texture: CubeTexture

  get texture() {
    return this._texture;
  }

  set texture(texture: CubeTexture) {
    this._texture = texture;
    this.envMapDeco.envMap = texture;
  }

  constructor(texture: CubeTexture) {
    super();
    this.shading = new Shading().decoCamera().decorate(this.envMapDeco)
    this.domeMesh.transform.scale.setAll(100);
    this.domeMesh.updateWorldMatrix();
    this.domeMesh.state.cullSide = CullSide.CullFaceNone
    this.domeMesh.g(domeSphere).s(this.shading)

    this._texture = texture;
    this.texture = texture;
  }

  render(engine: RenderEngine) {
    engine.render(this.domeMesh);
  }
}


