import { Vector4 } from "@artgl/math";
import { RenderEngine, Shading, CubeTexture } from "@artgl/core";
import { Mesh } from "./object/mesh";
import { CullSide } from "@artgl/webgl";
import { SphereGeometry } from "@artgl/lib-geometry";
import { CubeEnvMapShading, SkyShading } from "@artgl/lib-shading";
import { SceneNode } from "./scene-node";

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
  private node = new SceneNode();

  constructor() {
    super();
    this.node.transform.scale.setAll(100);
    this.node.updateWorldMatrix();
    this.domeMesh.state.cullSide = CullSide.CullFaceNone
  }

  render(engine: RenderEngine) {
    engine.renderObject(this.domeMesh, this.node.worldMatrix);
  }
}

export class CubeEnvrionmentMapBackGround extends Background {

  envMapDeco = new CubeEnvMapShading();
  shading: Shading;
  private domeMesh = new Mesh().g(domeSphere).s(this.shading)
  private node = new SceneNode();

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
    this.node.transform.scale.setAll(100);
    this.node.updateWorldMatrix();
    this.domeMesh.state.cullSide = CullSide.CullFaceNone
    this.domeMesh.g(domeSphere).s(this.shading)

    this._texture = texture;
    this.texture = texture;
  }

  render(engine: RenderEngine) {
    engine.renderObject(this.domeMesh, this.node.worldMatrix);
  }
}


