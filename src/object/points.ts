import { Geometry } from "../core/geometry";
import { RenderObject } from "../core/render-object";
import { Technique } from "../core/technique";
import { Material } from "../core/material";

export class Points extends RenderObject{
  constructor(geometry: Geometry, material: Material, technique: Technique) {
    super(geometry, material, technique);
  }
}