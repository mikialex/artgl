import { RenderObject } from "@artgl/core";
import { DrawMode } from "@artgl/webgl";

export class Line extends RenderObject{
  constructor() {
    super();
    this.drawMode = DrawMode.LINES;
  }

}