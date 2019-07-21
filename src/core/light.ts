import { SceneNode } from "../scene/scene-node";
import { Vector3 } from '../math/vector3';
import { Shading } from "./technique";


export class Light extends SceneNode{
  lightShading: Shading;
  
}

export class PointLightShading extends Shading {
  constructor() {
    super();
  }
}

export class PointLight extends Light{
  lightShading: PointLightShading;

  color: Vector3
  
}

export class DirectionalLightShading extends Shading {
  direction: Vector3
  color: Vector3
}

export class DirectionalLight extends Light{
  lightShading: DirectionalLightShading;

  direction: Vector3
  color: Vector3
}
