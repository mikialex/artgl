import { RenderObject } from "../core/render-object";
import { Matrix4 } from "../math/index";

export class RenderList{
  constructor() {
    
  }

  opaqueList: RenderObject[] = [];
  transparentList: RenderObject[] = [];

  opaqueCount = 0;
  transparentCount = 0;

  addRenderItem(object: RenderObject, transform: Matrix4) {
    // if (object.technique.isTransparent) {
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