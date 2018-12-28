import { Geometry } from "../core/geometry";
import { RenderObject } from "../core/render-object";
import { Technique } from "../core/technique";

export class Points extends RenderObject{
  constructor(geometry: Geometry, technique: Technique) {
    super(geometry, technique);
  }
}