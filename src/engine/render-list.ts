import { RenderObject } from "../core/render-object";
import { Nullable } from "../type";

export class RenderList {
  constructor() {
    
  }

  list: Nullable<RenderObject>[] = [];
  addRenderItem(object: RenderObject) {
    this.list.push(object);
  }

  forEach(visitor: (object: RenderObject) => any) {
    for (let i = 0; i < this.list.length; i++) {
      visitor(this.list[i]);
    }
  }

  renderListCursor: number = 0;
  next() {
    if (this.renderListCursor >= this.list.length) {
      return null;
    }
    const item = this.list[this.renderListCursor];
    this.renderListCursor++;
    return item
  }

  reset() {
    // TODO optimize here
    this.list = [];
  }

  resetCursor() {
    this.renderListCursor = 0;
  }

  sort(){
    
  }


}