import { RenderObject, PrimitiveVisitor, PrimitiveType } from "../core/render-object";
import { DrawMode } from "../webgl/const";
export class Mesh extends RenderObject{
  constructor() {
    super();

    this.drawType = DrawMode.TRIANGLES;
    this.primitiveType = PrimitiveType.triangle;
  }

  foreachPrimitive(visitor: PrimitiveVisitor) {
    if (this.geometry !== undefined) {
      // this.geometry.foreachPrimitive(visitor, this.range)
    }
  }
}