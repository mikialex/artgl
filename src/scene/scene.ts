import { SceneNode } from "./scene-node";
import { RenderObject } from "../core/render-object";
import { Light } from "../core/light";
import { Camera } from "../core/camera";

export class Scene {
  root: SceneNode
  
  objectList: RenderObject[];
  lightList: Light[];
  cameras: Camera[];

  flattenList: number[];
  flattenTreeToList() {
    
  }

  addEntity(node: SceneNode) {

  }

  removeEntity(node: SceneNode) {

  }
}