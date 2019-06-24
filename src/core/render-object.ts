import { Geometry } from "./geometry";
import { Technique } from "./technique";
import { SceneNode } from "../scene/scene-node";
import { Material } from "./material";
import { Nullable } from "../type";
import { DrawMode } from "../webgl/const";
import { DrawState } from "./draw-state";

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
 * Class for render drawcall description,  which is describe all drawable things
 * a drawable thing should have a geomemtry to define what to draw
 * and a technique to defined how to draw
 * and many other draw config such as blending depth behaviour
 * engine will read these infomantion and organize things properly
 * 
 * @export
 * @class RenderObject
 * @extends {SceneNode}
 */
export class RenderObject extends SceneNode{

  material?: Material;
  geometry?: Geometry;
  technique?: Technique;
  range?: RenderRange;
  state?: DrawState;

  drawType: DrawMode = DrawMode.TRIANGLES;

}