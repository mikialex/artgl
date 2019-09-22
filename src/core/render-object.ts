import { Geometry } from "./geometry";
import { SceneNode } from "../scene/scene-node";
import { Material } from "./material";
import { DrawMode } from "../webgl/const";
import { DrawState } from "./draw-state";
import { Face3 } from "../math/entity/face3";
import { Line3 } from "../math/entity/line3";
import { Vector3 } from "../math";
import { Shading, ShaderUniformDecorator } from "./shading";
import { StandardGeometry } from "../geometry/standard-geometry";
import { RenderEngine } from "../engine/render-engine";

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
export type ShadingParams = Map<ShaderUniformDecorator, ShaderUniformDecorator>

/**
 * Class for one render drawcall description,  which is describe all drawable things
 * a drawable thing should have a geometry to define what to draw
 * and a technique to defined how to draw
 * and many other draw config such as blending depth behavior defined in state object
 * engine will read these information and organize things properly
 */
export class RenderObject extends SceneNode {

  material?: Material;
  geometry?: Geometry;
  shading?: Shading;
  shadingParams: ShadingParams = new Map();
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

    engine.globalUniforms.MMatrix.setValue(this.worldMatrix);

    const shading = engine.getRealUseShading(this);

    // prepare technique
    engine.useShading(shading, this.shadingParams);

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