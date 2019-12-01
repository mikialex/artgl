import { RenderObject } from "@artgl/core/src/core/render-object";
import { DrawMode } from "@artgl/webgl";

export class Line extends RenderObject{
  constructor() {
    super();
    this.drawMode = DrawMode.LINES;
  }

}