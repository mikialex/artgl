import { RenderObject } from "../core/render-object";
import { Geometry } from "../core/geometry";
import { Material } from "../core/material";

export class Mesh extends RenderObject{
  constructor(geometry: Geometry, material: Material) {
    super(geometry, material);
    this.checkMaterialisValid(material);
  }

  private checkMaterialisValid(material) {
    
  }

}