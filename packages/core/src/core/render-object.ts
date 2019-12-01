import { Vector3, Face3, Line3, Matrix4 } from "@artgl/math"
import { DrawMode } from "@artgl/webgl";
import { StandardGeometry } from "@artgl/lib-geometry";
import { Material, Geometry, Shading, RenderEngine } from "../..";
import { DrawState } from "./render-entity/draw-state";

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
export class RenderObject {

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

  render(engine: RenderEngine, worldMatrix: Matrix4) {
    
    if (this.geometry === undefined) {
      return;
    }

    const shading = engine.getRealUseShading(this);

    // prepare technique
    engine.renderObjectWorldMatrix = worldMatrix;
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
