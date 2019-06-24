import { RenderObject, PrimitiveVisitor } from "../core/render-object";
import { DrawMode } from "../webgl/const";
export class Mesh extends RenderObject{
  constructor() {
    super();

    this.drawType = DrawMode.TRIANGLES;
  }

  foreachPrimitive(visitor: PrimitiveVisitor) {
    
  }
}