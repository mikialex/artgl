import { RenderObject } from "../core/render-object";
import { Geometry } from "../core/geometry";
import { Technique } from "../core/technique";
import { Material } from "../core/material";
import { CubeGeometry } from "../geometry/geo-lib/cube-geometry";
import { NormalTechnique } from "../technique/technique-lib/normal-tachnique";

export class Mesh extends RenderObject{
  constructor(geometry?: Geometry, material?: Material, technique?: Technique) {
    if (geometry === undefined) {
      geometry = new CubeGeometry();
    }
    if (material === undefined) {
      material = new Material();
    }
    if (technique === undefined) {
      technique = new NormalTechnique();
    }
    super(geometry, material, technique);
    this.checkMaterialisValid(technique);
  }

  private checkMaterialisValid(technique) {
    
  }

}