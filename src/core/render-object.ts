import { Geometry } from "./geometry";
import { Material } from "./material";

export class RenderObject{
  constructor(geometry: Geometry, material: Material) {
    this.geometry = geometry;
    this.material = material;
  }

  geometry: Geometry;
  material: Material;

  renderOrder: number;
}