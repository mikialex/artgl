import { Geometry } from "../core/geometry";
import { RenderObject } from "../core/render-object";
import { Material } from "../core/material";

export class Points extends RenderObject{
  constructor(geometry: Geometry, material: Material) {
    super(geometry, material);
  }
}