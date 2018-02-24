import { Vector3 } from "../math/vector3";

export class RenderObject {
  position = new Vector3()

  parent:RenderObject = null;
  children: Array<RenderObject> = [];
}