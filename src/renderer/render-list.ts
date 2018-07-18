import { Geometry } from "../core/geometry";
import { Material } from "../core/material";
import { RenderObject } from "../core/render-object";
import { Matrix4 } from "../math";

export interface RenderCall {
  object: RenderObject;
  transform: Matrix4;
}

export class RenderList{
  constructor() {
    
  }

  opaqueList: RenderCall[] = [];
  transparentList: RenderCall[] = [];

  opaqueCount = 0;
  transparentCount = 0;

  addRenderItem(object: RenderObject, transform: Matrix4) {
    // if (object.material.isTransparent) {
    //   this.transparentList.push({ object, transform});
    //   this.transparentCount++;
    // } else {
    //   if (this.opaqueCount < this.opaqueList.length) {
    //     this.opaqueList[this.opaqueCount]({ object, transform });
    //   } else {
    //     this.opaqueList.push({ object, transformation });
    //   }
    //   this.opaqueCount++;
    // }
  }

  clear() {
    this.opaqueCount = 0;
    this.transparentCount = 0;
  }

  sort(){
    
  }


}