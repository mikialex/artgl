import { Geometry } from "../core/geometry";
import { Material } from "../core/material";
import { RenderObject } from "../core/render-object";
import { Matrix4 } from "../math";

export interface RenderListItem{
  // transform:
  object: RenderObject,
}

export class RenderList{
  constructor() {
    
  }

  private opaqueList = [];
  private transparent = [];

  private opaqueCount = 0;
  private transparentCount = 0;

  addRenderItem(object: RenderObject, transformation: Matrix4) {
    if (object.material.isTransparent) {
      this.transparent.push({ object, transformation});
      this.transparentCount++;
    } else {
      if (this.opaqueCount < this.opaqueList.length) {
        this.opaqueList[this.opaqueCount]({ object, transformation });
      } else {
        this.opaqueList.push({ object, transformation });
      }
      this.opaqueCount++;
    }
  }

  clear() {
    this.opaqueCount = 0;
    this.transparentCount = 0;
  }


}