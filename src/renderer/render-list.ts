import { Geometry } from "../core/geometry";
import { Material } from "../core/material";
import { RenderObject } from "../core/render-object";

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

  public addRenderItem() {
    
  }

}