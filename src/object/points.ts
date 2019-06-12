import { RenderObject } from "../core/render-object";
import { DrawMode } from "../webgl/const";

export class Points extends RenderObject{
  constructor() {
    super();
    this.drawType = DrawMode.POINTS
  }

}