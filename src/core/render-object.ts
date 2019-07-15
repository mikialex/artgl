import { Geometry } from "./geometry";
import { Technique, Shading } from "./technique";
import { SceneNode } from "../scene/scene-node";
import { Material } from "./material";
import { DrawMode } from "../webgl/const";
import { DrawState } from "./draw-state";
import { Face3 } from "../math/entity/face3";
import { Line3 } from "../math/entity/line3";
import { Vector3 } from "../artgl";

export class RenderRange {
  constructor(start?: number, count?: number) {
    if (start !== undefined) {
      this.start = start;
    }
    if (count !== undefined) {
      this.count = count;
    }
  }

  setRange(start: number, count: number): void {
    this.start = start;
    this.count = count;
  }

  // static getFullRangeFromGeometry(geometry: Geometry): RenderRange {
  //   if (geometry.indexBuffer !== undefined) {
  //     return geometry.indexBuffer.data.length;
  //   }
  // }

  start: number = 0;
  count: number = 0;

}

export const enum PrimitiveType {
  triangle,
  point,
  lineSegment,
}

export type RenderablePrimitive = Line3 | Vector3 | Face3
export type PrimitiveVisitor = (prim: RenderablePrimitive) => any

/**
 * Class for render drawcall description,  which is describe all drawable things
 * a drawable thing should have a geometry to define what to draw
 * and a technique to defined how to draw
 * and many other draw config such as blending depth behavior defined in state object
 * engine will read these information and organize things properly
 * 
 * @export
 * @class RenderObject
 * @extends {SceneNode}
 */
export class RenderObject extends SceneNode {

  material?: Material;
  geometry?: Geometry;
  technique?: Technique;
  range?: RenderRange;
  state?: DrawState;

  // sometimes something draw as mesh(tri), but act like line, like fatLine 
  // so, drawType and primitiveType is different things 
  drawType: DrawMode = DrawMode.TRIANGLES;
  primitiveType: PrimitiveType = PrimitiveType.triangle;

  foreachPrimitive(_visitor: PrimitiveVisitor) { throw "not implement" }

}