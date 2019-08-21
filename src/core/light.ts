import { SceneNode } from "../scene/scene-node";
import { ShaderGraph } from "../shader-graph/shader-graph";
import { uniformFromValue, constValue } from "../shader-graph/node-maker";
import { ShaderUniformProvider, ShaderUniformDecorator, getPropertyUniform, getPropertyUniform } from "./shading";
import { ShaderCommonUniformInputNode, ShaderNode } from "../shader-graph/shader-node";
import { ShaderFunction } from "../shader-graph/shader-function";
import { Observable } from "./observable";
import { Vector3 } from '../math';

// TODO I cant figure out right multi inheritance impl with strong type, code duplicate 

export abstract class Light<T> extends SceneNode
  implements ShaderUniformProvider, ShaderUniformDecorator {
  constructor() {
    super();
    // need check if has initialized by decorator
    if (this.uniforms === undefined) {
      this.uniforms = new Map();
    }
    if (this.propertyUniformNameMap === undefined) {
      this.propertyUniformNameMap = new Map();
    }
  }

  decorate(decorated: ShaderGraph): void {
    decorated
      .setFragmentRoot(
        collectLight.make()
          .input("base", decorated.getFragRoot())
          .input("light", this.produceLightIntensity(decorated))
      )
  }

  foreachProvider(visitor: (p: ShaderUniformProvider) => any) {
    return visitor(this);
  }

  abstract produceLightFragDir(_graph: ShaderGraph): ShaderNode 

  abstract produceLightIntensity(_graph: ShaderGraph): ShaderNode 

  notifyNeedRedecorate: Observable<ShaderUniformDecorator> = new Observable()

  hasAnyUniformChanged: boolean = true;

  uniforms: Map<string, any>;

  propertyUniformNameMap: Map<string, string>;

  nodeCreated: Map<string, ShaderCommonUniformInputNode> = new Map();

  getPropertyUniform(name: keyof T): ShaderCommonUniformInputNode {
    return getPropertyUniform(this, name)
  }
  
}

export const collectLight = new ShaderFunction({
  source: `
  vec3 add(
    vec3 base,
    vec3 light){
      return base + light;
  }
  `
});

export function collectLightNodes<T>(
  lights: Light<T>[],
  lightNodeMaker: (light: Light<T>) => ShaderNode) {
  
  let root: ShaderNode = constValue(new Vector3());
  lights.forEach(light => {
    const lightNode = lightNodeMaker(light);
    root = collectLight.make()
      .input("base", root)
      .input("light", lightNode)
  })

  return root;
}