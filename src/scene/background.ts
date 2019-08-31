import { Vector4 } from "../math";
import { RenderEngine } from "../engine/render-engine";

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

// export class SkyBackGround extends BackGround {
  
// }



