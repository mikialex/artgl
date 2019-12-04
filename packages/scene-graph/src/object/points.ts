import { RenderObject } from "@artgl/core";
import { DrawMode } from "@artgl/webgl";

export class Points extends RenderObject{
  constructor() {
    super();
    this.drawMode = DrawMode.POINTS
  }

}