import { RenderObject } from "@artgl/core/src/core/render-object";
import { Nullable } from "@artgl/shared";

export class RenderList {

  private list: Nullable<RenderObject>[] = [];
  private realLength: number = 0;

  public addRenderItem(object: RenderObject) {
    if (this.realLength < this.list.length) {
      this.list[this.realLength] = object;
    } else {
      this.list.push(object);
    }
    this.realLength++;
  }

  forEach(visitor: (object: RenderObject) => any) {
    for (let i = 0; i < this.realLength; i++) {
      visitor(this.list[i] as RenderObject);
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
    this.realLength = 0;
  }

  resetCursor() {
    this.renderListCursor = 0;
  }

  clear() {
    this.list = [];
  }

  sort(sorter: (a: RenderObject, b: RenderObject)=> number){
    this.list.sort(sorter as any);
  }

}