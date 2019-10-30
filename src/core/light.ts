import { SceneNode } from "../scene/scene-node";
import { ShaderGraph } from "../shader-graph/shader-graph";
import { constValue, vec4 } from "../shader-graph/node-maker";
import { ShaderUniformProvider, ShaderUniformDecorator, getPropertyUniform, ProviderUploadCache } from "./shading";
import { ShaderUniformInputNode, ShaderNode } from "../shader-graph/shader-node";
import { ShaderFunction } from "../shader-graph/shader-function";
import { Observable } from "./observable";
import { Vector3 } from '../math';

// TODO I cant figure out right multi inheritance impl with strong type, code duplicate 

export abstract class Light<T> extends SceneNode
  implements ShaderUniformProvider, ShaderUniformDecorator {

  decorate(decorated: ShaderGraph): void {
    decorated
      .setFragmentRoot(
        collectLight.make()
          .input("base", decorated.getFragRoot().swizzling('xyz'))
          .input("light", this.produceLightIntensity(decorated))
      )
  }

  foreachProvider(visitor: (p: ShaderUniformProvider) => any) {
    return visitor(this);
  }

  abstract produceLightFragDir(_graph: ShaderGraph): ShaderNode

  abstract produceLightIntensity(_graph: ShaderGraph): ShaderNode

  notifyNeedRedecorate: Observable<ShaderUniformDecorator> = new Observable()

  shouldProxyedByUBO = true;
  uploadCache!: ProviderUploadCache;

  nodeCreated: Map<string, ShaderUniformInputNode> = new Map();

  getPropertyUniform(name: keyof T): ShaderUniformInputNode {
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

  return vec4(root, constValue(1));
}