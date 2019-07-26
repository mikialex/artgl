
import { generateUUID, Vector3, Matrix4 } from "../math";
import { Nullable } from "../type";
import { GLProgramConfig, GLProgram } from "../webgl/program";
import { ShaderGraph } from "../shader-graph/shader-graph";
import { Observable } from "./observable";
import { RenderEngine } from "../engine/render-engine";
import { ShaderCommonUniformInputNode } from '../shader-graph/shader-node';
import { GLDataType } from '../webgl/shader-util';
import { Vector2 } from '../math/vector2';
import { Vector4 } from '../math/vector4';
import { uniform } from '../shader-graph/node-maker';

export interface ShaderUniformProvider{

  /**
  * impl this to decorate your shader source, add uniform input
  */
  decorate(graph: ShaderGraph): void;

  uniforms: Map<string, any>;
}

export class Shading {
  uuid = generateUUID();
  graph: ShaderGraph = new ShaderGraph();

  programConfigCache: Nullable<GLProgramConfig> = null;
  needRebuildShader: boolean = true;

  uniformProvider: ShaderUniformProvider[] = [];

  decorate(deco: ShaderUniformProvider): Shading {
    this.uniformProvider.push(deco);
    return this;
  }

  afterShaderCompiled: Observable<GLProgramConfig> = new Observable();
  build() {
    this.graph.reset()
    this.uniformProvider.forEach(provider => {
      provider.decorate(this.graph);
    })
  }

  getProgramConfig() {
  if (this.needRebuildShader) {
      this.build();
    this.programConfigCache = this.graph.compile();
    this.afterShaderCompiled.notifyObservers(this.programConfigCache)
      this.needRebuildShader = false;
    }
    return this.programConfigCache;
  }

  getProgram(engine: RenderEngine): GLProgram {
    if (this.needRebuildShader) {
      this.disposeProgram(engine);
    }
    let program = engine.getProgram(this);
    if (program === undefined) {
      program = engine.createProgram(this);
    }
    return program;
  }

  disposeProgram(engine: RenderEngine): void {
    engine.deleteProgram(this);
  }

}



export function MapUniform<T>(remapName: string) {
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

export abstract class BaseEffectShading<T> implements ShaderUniformProvider{

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
