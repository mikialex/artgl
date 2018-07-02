import { SceneNode } from "./scene-node";
import { RenderObject } from "../core/render-object";
import { Light } from "../core/light";

export class Scene {
  root: SceneNode
  
  objectList: RenderObject[];
  lightList: Light[];

  flattenList: number[];
  flattenTreeToList() {
    
  }

  addEntity(node: SceneNode) {

  }

  removeEntity(node: SceneNode) {

  }
}