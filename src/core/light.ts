import { SceneNode } from "../scene/scene-node";
import { ShaderGraph } from "../shader-graph/shader-graph";
import { uniformFromValue } from "../shader-graph/node-maker";
import { ShaderUniformProvider, ShaderUniformDecorator } from "./shading";
import { ShaderCommonUniformInputNode, ShaderNode } from "../shader-graph/shader-node";
import { ShaderFunction } from "../shader-graph/shader-function";
import { Observable } from "./observable";

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
          .input("light", this.produceDefaultLightFragEffect(decorated))
      )
  }

  foreachProvider(visitor: (p: ShaderUniformProvider) => any) {
    return visitor(this);
  }

  abstract produceDefaultLightFragEffect(_graph: ShaderGraph): ShaderNode

  abstract produceLightFragDir(_graph: ShaderGraph): ShaderNode 

  abstract produceLightIntensity(_graph: ShaderGraph): ShaderNode 

  notifyNeedRedecorate: Observable<ShaderUniformDecorator> = new Observable()

  hasAnyUniformChanged: boolean;

  uniforms: Map<string, any>;

  propertyUniformNameMap: Map<string, string>;

  nodeCreated: Map<string, ShaderCommonUniformInputNode> = new Map();
  getPropertyUniform(name: keyof T): ShaderCommonUniformInputNode {
    if (this.nodeCreated.has(name as string)) {
      return this.nodeCreated.get(name as string);
    }
    const uniformName = this.propertyUniformNameMap.get(name as string);
    const value = this[name as string];
    if (value === undefined) {
      throw "uniform value not given"
    }
    const node = uniformFromValue(uniformName, value);
    this.nodeCreated.set(name as string, node);
    return node;
  }
}

export const collectLight = new ShaderFunction({
  source: `
  vec4 add(
    vec4 base,
    vec4 light){
      return base + light;
  }
  `
});