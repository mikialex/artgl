
import { generateUUID } from "../math";
import { Nullable } from "../type";
import { GLProgramConfig, GLProgram } from "../webgl/program";
import { ShaderGraph } from "../shader-graph/shader-graph";
import { Observable, Observer } from "./observable";
import { RenderEngine } from "../engine/render-engine";
import { ShaderCommonUniformInputNode } from '../shader-graph/shader-node';
import { uniformFromValue } from '../shader-graph/node-maker';
import { replaceFirst } from '../util/array';

export interface ShaderUniformDecorator {
  /**
  * impl this to decorate your shader source, add uniform input
  */
  decorate(graph: ShaderGraph): void;

  /**
   * one UniformProvider can have others provider depends and inject, return them in a array
   */
  foreachProvider(visitor: (p: ShaderUniformProvider) => any): void;

  notifyNeedRedecorate: Observable<ShaderUniformDecorator>;
}

type propertyName = string;
type uniformName = string;
export interface ShaderUniformProvider {

  // mark any change in this uniform group
  hasAnyUniformChanged: boolean;

  // mark the shader need recompile
  uniforms: Map<uniformName, any>;
  propertyUniformNameMap: Map<propertyName, uniformName>;
}

export class Shading {
  uuid = generateUUID();
  graph: ShaderGraph = new ShaderGraph();

  private _programConfigCache: Nullable<GLProgramConfig> = null;
  private _needRebuildShader: boolean = true;

  _decorators: ShaderUniformDecorator[] = [];
  private _decoratorSlot: Set<ShaderUniformDecorator> = new Set();
  private _decoratorObs: Map<ShaderUniformDecorator, Observer<ShaderUniformDecorator>> = new Map();

  updateDecorator(oldDecorator: ShaderUniformDecorator, newDecorator: ShaderUniformDecorator) {
    if (!this._decoratorSlot.has(oldDecorator)) {
      throw  `decorator has not been decorate before`
    }

    if (oldDecorator === newDecorator) {
      return;
    }

    this._decoratorSlot.delete(oldDecorator);
    this._decoratorSlot.add(newDecorator);

    replaceFirst(this._decorators, oldDecorator, newDecorator);
    this._needRebuildShader = true;
  }

  reset() {
    this._decoratorObs.forEach((obs, dec) => {
      dec.notifyNeedRedecorate.remove(obs);
    })
    this._decoratorObs.clear();
    this._decoratorSlot.clear();
    this._decorators = [];
    this._needRebuildShader = true;
    this._programConfigCache = null;
  }

  decorate(decorator: ShaderUniformDecorator): Shading {
    if (this._decoratorSlot.has(decorator)) {
      throw `this decorator has been decorate before`
    }

    const obs = decorator.notifyNeedRedecorate.add((_deco) => {
      this._needRebuildShader = true;
    })
    this._decoratorObs.set(decorator, obs);

    this._decoratorSlot.add(decorator)
    this._decorators.push(decorator);
    return this;
  }

  afterShaderCompiled: Observable<GLProgramConfig> = new Observable();
  build() {
    this.graph.reset()
    this._decorators.forEach(decorator => {
      decorator.decorate(this.graph);
    })
  }

  getProgramConfig() {

    if (this._needRebuildShader) {
      this.build();
      this._programConfigCache = this.graph.compile();
      this.afterShaderCompiled.notifyObservers(this._programConfigCache)
      this._needRebuildShader = false;
    }
    return this._programConfigCache;
  }

  getProgram(engine: RenderEngine): GLProgram {
    if (this._needRebuildShader) {
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

export function MarkNeedRedecorate() {
  return (target: ShaderUniformDecorator, key: string) => {
    if (target.notifyNeedRedecorate === undefined) {
      target.notifyNeedRedecorate = new Observable();
    }
    let val = target[key];
    const getter = () => {
      return val;
    };
    const setter = (value) => {
      const oldValue = val;
      val = value;
      if (oldValue !== value) {
        target.notifyNeedRedecorate.notifyObservers(target);
      }
    };

    Object.defineProperty(target, key, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true,
    });
  };
}


export function MapUniform(remapName: string) {
  return (target: ShaderUniformProvider, key: string) => {
    if (target.uniforms === undefined) {
      target.uniforms = new Map();
    }
    if (target.propertyUniformNameMap === undefined) {
      target.propertyUniformNameMap = new Map();
    }

    let val = target[key];
    const getter = () => {
      return val;
    };
    const setter = (value) => {
      target.uniforms.set(remapName, value);
      target.hasAnyUniformChanged = true;
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

export abstract class BaseEffectShading<T>
  implements ShaderUniformProvider, ShaderUniformDecorator {
  constructor() {
    // need check if has initialized by decorator
    if (this.uniforms === undefined) {
      this.uniforms = new Map();
    }
    if (this.propertyUniformNameMap === undefined) {
      this.propertyUniformNameMap = new Map();
    }

    if (this.notifyNeedRedecorate === undefined) {
      this.notifyNeedRedecorate = new Observable()
    }
  }

  abstract decorate(graph: ShaderGraph): void;

  foreachProvider(visitor: (p: ShaderUniformProvider) => any) {
    return visitor(this);
  }

  notifyNeedRedecorate: Observable<ShaderUniformDecorator>

  hasAnyUniformChanged: boolean = true;
  propertyUniformNameMap: Map<string, string>;
  uniforms: Map<string, any>;

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
