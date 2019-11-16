import { Geometry } from "../../core/render-entity/geometry";
import { SceneNode, ExtendWithSceneNode } from "../scene-node";
import { Material } from "../../core/render-entity/material";
import { DrawState } from "../draw-state";
import { Vector3, Face3, Line3 } from "@artgl/math"
import { Shading } from "../../core/shading";
import { StandardGeometry } from "../../geometry/standard-geometry";
import { RenderEngine } from "../../core/render-engine";
import { DrawMode } from "@artgl/webgl";

export class RenderRange {
  static fromStandardGeometry(geometry: StandardGeometry) {
    return new RenderRange(0, geometry.indexBuffer.count);
  }

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

  start: number = 0;
  count: number = 0;

  instanceCount: number = 1;

}

export const enum PrimitiveType {
  triangle,
  point,
  lineSegment,
}

export type RenderablePrimitive = Line3 | Vector3 | Face3
export type PrimitiveVisitor = (prim: RenderablePrimitive) => any

/**
 * Class for one render drawcall description,  which is describe all drawable things
 * a drawable thing should have a geometry to define what to draw
 * and a technique to defined how to draw
 * and many other draw config such as blending depth behavior defined in state object
 * engine will read these information and organize things properly
 */
export class RenderObjectSelf {

  material?: Material;
  geometry?: Geometry;
  shading?: Shading;
  range?: RenderRange;
  state: DrawState =  new DrawState();

  // sometimes something draw as mesh(tri), but act like line, like fatLine 
  // so, drawMode and primitiveType is different things 
  drawMode: DrawMode = DrawMode.TRIANGLES;
  primitiveType: PrimitiveType = PrimitiveType.triangle;

  foreachPrimitive(_visitor: PrimitiveVisitor) { throw "not implement" }

  g(geometry: Geometry) {
    this.geometry = geometry;
    return this;
  }

  m(material: Material) {
    this.material = material;
    return this;
  }

  s(shading: Shading) {
    this.shading = shading;
    return this;
  }

  render(engine: RenderEngine) {
    
    if (this.geometry === undefined) {
      return;
    }

    const shading = engine.getRealUseShading(this);

    // prepare technique
    engine.renderObjectWorldMatrix = this.worldMatrix;
    engine.useShading(shading);

    // prepare material
    engine.useMaterial(this.material);
    
    // prepare geometry
    engine.useGeometry(this.geometry);

    engine.useRange(this.geometry, this.range)

    this.state.syncGL(engine.renderer)

    // render
    engine.renderer.draw(this.drawMode);

    engine.useShading(null);
  }
}

export interface RenderObjectSelf extends SceneNode { }
export interface RenderObject extends SceneNode, RenderObjectSelf { }
export const RenderObject = ExtendWithSceneNode(RenderObjectSelf)