import { SceneNode } from "../scene/scene-node";
import { Vector3 } from '../math/vector3';
import { ShaderFunction } from '../shader-graph/shader-function';
import { GLDataType } from '../webgl/shader-util';

interface LightConfig{
  
}

export class Light extends SceneNode{
  constructor() {
    super();
  }
  
}

const PointLightShader = new ShaderFunction({
  name: 'pointLight',
  description: 'compute a pointlight output',
  source: `
    return sourceA + sourceB;
  `,
  inputs: [
    {
      name: "color",
      type: GLDataType.floatVec3
    },
    {
      name: "light_position",
      type: GLDataType.floatVec3
    },
    {
      name: "normal",
      type: GLDataType.floatVec3
    },
  ],
  returnType: GLDataType.floatVec3
})

export class PointLight extends Light {
  static shaderFunction = PointLightShader;
  constructor() {
    super();
  }
  color: Vector3
}

export class DirectionalLight extends Light {
  direction: Vector3
  color: Vector3
}