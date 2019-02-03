import { Geometry } from "./geometry";
import { Technique } from "./technique";
import { SceneNode } from "../scene/scene-node";
import { Material } from "./material";
import { Nullable } from "../type";

export class RenderRange{
  constructor(start?:number, count?:number) {
    if (start !== undefined) {
      this.start = start;
    }
    if (count !== undefined) {
      this.count = count;
    }
  }

  setRange(start:number, count:number): void {
    this.start = start;
    this.count = count;
  }

  // static getFullRangeFromGeometry(geomemtry: Geometry): RenderRange {
  //   if (geomemtry.indexBuffer !== undefined) {
  //     return geomemtry.indexBuffer.data.length;
  //   }
  // }

  start: number = 0;
  count: number = 0;

}


/**
 * render drawcall decription,  
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
  constructor(
    technique?: Technique,
    geometry?: Geometry,
    material?: Material,
    range?: RenderRange
  ) {
    super();
    this.technique = technique;
    this.geometry = geometry;
    this.material = material;
    this.range = range;
  }

  material: Material;
  geometry: Geometry;
  technique: Technique;
  range: RenderRange

  renderOrder: number;
}