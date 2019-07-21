import { RenderObject } from "../core/render-object";
import { DrawMode } from "../webgl/const";

export class Line extends RenderObject{
  constructor() {
    super();
    this.drawMode = DrawMode.LINES;
  }

}