import { Geometry } from "./geometry";
import { Technique } from "./technique";
import { SceneNode } from "../scene/scene-node";

export interface Range{

}


/**
 * render drawcall decription 
 * which is decribe all drawable things
 * a drawable thing should have a geomemtry to define what to draw
 * and a technique to defined how to draw
 * and many other draw config such as blending depth behaviour
 * engine will understand these infomantion and organize things properly
 * @export
 * @class RenderObject
 * @extends {SceneNode}
 */
export class RenderObject extends SceneNode{
  constructor(geometry: Geometry, technique: Technique) {
    super();
    this.geometry = geometry;
    this.technique = technique;
  }

  geometry: Geometry;
  technique: Technique;
  ranger: Range

  renderOrder: number;
}