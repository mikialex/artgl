
import { generateUUID } from "../math";
import { Nullable } from "../type";
import { GLProgramConfig, GLProgram } from "../webgl/program";
import { ShaderGraph } from "../shader-graph/shader-graph";
import { Observable, Observer } from "./observable";
import { RenderEngine } from "../engine/render-engine";
import { ShaderCommonUniformInputNode, ShaderTextureNode } from '../shader-graph/shader-node';
import { uniformFromValue, texture } from '../shader-graph/node-maker';
import { replaceFirst } from '../util/array';

export { MapUniform } from "./shading-util";

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
  nodeCreated: Map<string, ShaderCommonUniformInputNode>;
}

type propertyName = string;
type uniformName = string;
type textureShaderName = string;
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
  private _namedDecoratorMap: Map<string, ShaderUniformDecorator> = new Map();
  private _decoratorObs: Map<ShaderUniformDecorator, Observer<ShaderUniformDecorator>> = new Map();

  getDecoratorByName(name: string) {
    return this._namedDecoratorMap.get(name)
  }

  updateDecorator(oldDecorator: ShaderUniformDecorator, newDecorator: ShaderUniformDecorator) {
    if (!this._decoratorSlot.has(oldDecorator)) {
      throw `decorator has not been decorate before`
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
    this.framebufferTextureMap = {};
    this._decoratorObs.clear();
    this._decoratorSlot.clear();
    this._namedDecoratorMap.clear();
    this._decorators = [];
    this._needRebuildShader = true;
    this._programConfigCache = null;
  }

  decorate(decorator: ShaderUniformDecorator, name?: string): Shading {
    if (this._decoratorSlot.has(decorator)) {
      throw `this decorator has been decorate before`
    }

    if (name !== undefined) {
      this._namedDecoratorMap.set(name, decorator);
    }

    const obs = decorator.notifyNeedRedecorate.add((_deco) => {
      this._needRebuildShader = true;
    })!
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
    return this._programConfigCache!;
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

  framebufferTextureMap: { [index: string]: string } = {};
  defineFBOInput(inputFramebufferName: string, uniformName: string): void {
    this.framebufferTextureMap[uniformName] = inputFramebufferName;
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
    let val = (target as any)[key];
    const getter = () => {
      return val;
    };
    const setter = (value: any) => {
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

export { BaseEffectShading } from './shading-base';

export function getPropertyUniform<T, K extends ShaderUniformDecorator & ShaderUniformProvider>
  (env: K, name: keyof T): ShaderCommonUniformInputNode {
  const uniformNode = env.nodeCreated.get(name as string);
  if (uniformNode !== undefined) {
    return uniformNode;
  }
  const uniformName = env.propertyUniformNameMap.get(name as string);

  if (uniformName === undefined) {
    throw `${name} uniform name not found, maybe forget decorator`
  }

  const value = (env as unknown as T)[name];
  if (value === undefined) {
    throw "uniform value not given"
  }
  const node = uniformFromValue(uniformName, value);
  env.nodeCreated.set(name as string, node);
  return node;
}