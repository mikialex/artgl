import { ShaderUniformProvider } from "../../core/shading";
import { GLDataType } from "../../webgl/shader-util";
import { ShaderFunction } from "../../shader-graph/shader-function";
import { texture, uniform, screenQuad } from "../../shader-graph/node-maker";
import { UvFragVary, ShaderGraph } from '../../shader-graph/shader-graph';
import { ShaderCommonUniformInputNode } from '../../shader-graph/shader-node';
import { Vector2 } from '../../math/vector2';
import { Vector3, Matrix4 } from '../../math';
import { Vector4 } from '../../math/vector4';


const tssaoBlend = new ShaderFunction({
  source: `
  vec4 tssaoBlend(
    vec3 color, 
    vec3 aoColor, 
    float sampleCount, 
    float tssaoComposeRate,
    float tssaoShowThreshold,
    float tssaoComposeThreshold
    ) {
    vec3 aoModify = vec3(1.0) - tssaoComposeRate * (vec3(1.0) - aoColor) * vec3(min(sampleCount / tssaoShowThreshold, 1.0));
    aoModify = clamp(aoModify + vec3(tssaoComposeThreshold), vec3(0.0), vec3(1.0));
    return vec4(color * aoModify, 1.0);
  }
  `
})


function MapUniform<T>(remapName: string) {
  return (target: BaseEffectShading<T>, key: string) => {
    let val: T = target[key];
    const getter = () => {
      return val;
    };
    const setter = (value: T) => {
      target.uniforms.set(remapName, value);
      val = value;
    };

    target.propertyUniformNameMap.set(key, remapName);

    Object.defineProperty(target, key, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true,
    });
  };
}

abstract class BaseEffectShading<T> implements ShaderUniformProvider{

  providerName: string;

  abstract decorate(graph: ShaderGraph): void;

  propertyUniformNameMap: Map<string, string> = new Map();
  uniforms: Map<string, any> = new Map();

  getPropertyUniform(name: keyof T): ShaderCommonUniformInputNode {
    const uniformName = this.propertyUniformNameMap.get(name as string);
    const value = this[name as string];
    if (value === undefined) {
      throw "uniform value not given"
    }
    if (typeof value === "number") {
      return uniform(uniformName, GLDataType.float).default(value);
    } else if (value instanceof Vector2) {
      return uniform(uniformName, GLDataType.floatVec2).default(value);
    } else if (value instanceof Vector3) {
      return uniform(uniformName, GLDataType.floatVec3).default(value);
    } else if (value instanceof Vector4) {
      return uniform(uniformName, GLDataType.floatVec4).default(value);
    } else if (value instanceof Matrix4) {
      return uniform(uniformName, GLDataType.Mat4).default(value);
    } else {
      throw "un support uniform value"
    }
  }
}

export class TSSAOBlendShading extends BaseEffectShading<TSSAOBlendShading> {
  providerName: "TSSAOBlendShading"

  @MapUniform("u_sampleCount")
  sampleCount: number = 0;

  @MapUniform("u_tssaoComposeRate")
  tssaoComposeRate: number = 1;

  @MapUniform("u_tssaoShowThreshold")
  tssaoShowThreshold: number = 200;

  @MapUniform("u_tssaoComposeThreshold")
  tssaoComposeThreshold: number = 0.5;

  decorate(graph: ShaderGraph) {
    graph
      .setVertexRoot(screenQuad())
      .declareFragUV()
      .setFragmentRoot(
        tssaoBlend.make()
          .input("color", texture("basic").fetch(graph.getVary(UvFragVary)).swizzling("xyz"))
          .input("aoColor", texture("tssao").fetch(graph.getVary(UvFragVary)).swizzling("xyz"))
          .input('sampleCount', this.getPropertyUniform('sampleCount'))
          .input('tssaoComposeRate', this.getPropertyUniform('tssaoComposeRate'))
          .input('tssaoShowThreshold', this.getPropertyUniform('tssaoShowThreshold'))
          .input('tssaoComposeThreshold', this.getPropertyUniform('tssaoComposeThreshold'))
      )
  }

}