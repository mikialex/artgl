import { RenderObject } from "../core/render-object";
import { Geometry } from "../core/geometry";
import { Technique } from "../core/technique";

export class Mesh extends RenderObject{
  constructor(geometry: Geometry, technique: Technique) {
    super(geometry, technique);
    this.checkMaterialisValid(technique);
  }

  private checkMaterialisValid(technique) {
    
  }

}