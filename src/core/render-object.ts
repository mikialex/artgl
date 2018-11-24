import { Geometry } from "./geometry";
import { Material } from "./material";
import { SceneNode } from "../scene/scene-node";

/**
 * render drawcall decription 
 * which is decribe all drawable things
 * a drawable thing should have a geomemtry to define what to draw
 * and a material to defined how to draw
 * and many other draw config such as blending depth behaviour
 * engine will understand these infomantion and organize things properly
 * @export
 * @class RenderObject
 * @extends {SceneNode}
 */
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