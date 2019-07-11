import { SceneNode } from "../scene/scene-node";
import { Vector3 } from '../math/vector3';
import { ShaderFunction } from '../shader-graph/shader-function';
import { GLDataType } from '../webgl/shader-util';

interface LightConfig{
  
} 

export class Light extends SceneNode{
  shaderFunction: ShaderFunction;
  constructor() {
    super();
  }
  
}

const PointLightShader = new ShaderFunction({
  description: 'compute a pointlight output',
  source: `
    vec3 pointLight(vec3 position, vec3 lightposition, vec3 normal){
      return sourceA + sourceB;
    }
  `,
})

export class PointLight extends Light {
  constructor() {
    super();
    this.shaderFunction = PointLightShader;
  }
  color: Vector3
}

export class DirectionalLight extends Light {
  direction: Vector3
  color: Vector3
}