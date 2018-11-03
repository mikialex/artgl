import { Geometry } from "./geometry";
import { Material } from "./material";
import { SceneNode } from "../scene/scene-node";

export class RenderObject extends SceneNode{
  constructor(geometry: Geometry, material: Material) {
    super();
    this.geometry = geometry;
    this.material = material;
  }

  geometry: Geometry;
  material: Material;

  renderOrder: number;
}